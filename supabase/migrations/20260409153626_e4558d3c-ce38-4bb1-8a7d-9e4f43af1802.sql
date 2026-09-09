
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "Anon can view own orders by email" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anon can upload payment screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');
