
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'viewer');
CREATE TYPE public.task_status AS ENUM ('pending', 'completed', 'missed');
CREATE TYPE public.frequency AS ENUM ('daily','alternate','weekly','biweekly','monthly','custom');
CREATE TYPE public.health_rating AS ENUM ('excellent','good','average','poor');
CREATE TYPE public.quality_grade AS ENUM ('A','B','C');
CREATE TYPE public.crop_status AS ENUM ('seeded','growing','nearly_ready','ready','harvested');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Plants
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  variety TEXT,
  planting_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  notes TEXT,
  estimated_harvest_date DATE,
  status public.crop_status NOT NULL DEFAULT 'seeded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plants TO authenticated;
GRANT ALL ON public.plants TO service_role;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plants" ON public.plants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Generic schedule maker
CREATE TABLE public.watering_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  amount TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  frequency public.frequency NOT NULL DEFAULT 'daily',
  status public.task_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watering_schedules TO authenticated;
GRANT ALL ON public.watering_schedules TO service_role;
ALTER TABLE public.watering_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own water" ON public.watering_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.pesticide_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  pesticide_name TEXT NOT NULL,
  quantity TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  frequency public.frequency NOT NULL DEFAULT 'weekly',
  instructions TEXT,
  status public.task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pesticide_schedules TO authenticated;
GRANT ALL ON public.pesticide_schedules TO service_role;
ALTER TABLE public.pesticide_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pest" ON public.pesticide_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fertilizer_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  fertilizer_name TEXT NOT NULL,
  quantity TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  frequency public.frequency NOT NULL DEFAULT 'monthly',
  status public.task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fertilizer_schedules TO authenticated;
GRANT ALL ON public.fertilizer_schedules TO service_role;
ALTER TABLE public.fertilizer_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fert" ON public.fertilizer_schedules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Growth logs
CREATE TABLE public.growth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  height_cm NUMERIC,
  leaf_count INTEGER,
  health public.health_rating NOT NULL DEFAULT 'good',
  observation TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_logs TO authenticated;
GRANT ALL ON public.growth_logs TO service_role;
ALTER TABLE public.growth_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own growth" ON public.growth_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Harvests
CREATE TABLE public.harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'kg',
  grade public.quality_grade NOT NULL DEFAULT 'A',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvests TO authenticated;
GRANT ALL ON public.harvests TO service_role;
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own harvest" ON public.harvests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for plants
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER plants_touch BEFORE UPDATE ON public.plants
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
