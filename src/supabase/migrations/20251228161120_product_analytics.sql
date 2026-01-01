-- Product Analytics Tables
-- Stores individual events and aggregated summaries for product analytics

-- Events table: stores raw events
CREATE TABLE IF NOT EXISTS product_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL REFERENCES bigbuy_products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'cart_add', 'purchase', 'bounce')),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  time_on_page_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_product_id ON product_analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_event_type ON product_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_created_at ON product_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_session_id ON product_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_product_type_created ON product_analytics_events(product_id, event_type, created_at);

-- Summary table: aggregated metrics per product
CREATE TABLE IF NOT EXISTS product_analytics_summary (
  product_id INTEGER PRIMARY KEY REFERENCES bigbuy_products(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_cart_adds INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  avg_time_on_page_ms INTEGER DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0.0,
  conversion_rate FLOAT DEFAULT 0.0,
  ctr FLOAT DEFAULT 0.0,
  ml_score FLOAT DEFAULT 0.0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting by ML score
CREATE INDEX IF NOT EXISTS idx_product_analytics_summary_ml_score ON product_analytics_summary(ml_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_summary_conversion_rate ON product_analytics_summary(conversion_rate DESC);

-- Function to update summary from events
CREATE OR REPLACE FUNCTION update_product_analytics_summary()
RETURNS TRIGGER AS $$
DECLARE
  _product_id INTEGER;
  _total_views INTEGER;
  _total_clicks INTEGER;
  _total_cart_adds INTEGER;
  _total_purchases INTEGER;
  _total_bounces INTEGER;
  _avg_time_on_page_ms INTEGER;
  _bounce_rate FLOAT;
  _conversion_rate FLOAT;
  _ctr FLOAT;
BEGIN
  _product_id := NEW.product_id;
  
  -- Calculate aggregated metrics
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'view'),
    COUNT(*) FILTER (WHERE event_type = 'click'),
    COUNT(*) FILTER (WHERE event_type = 'cart_add'),
    COUNT(*) FILTER (WHERE event_type = 'purchase'),
    COUNT(*) FILTER (WHERE event_type = 'bounce'),
    COALESCE(AVG(time_on_page_ms) FILTER (WHERE time_on_page_ms IS NOT NULL), 0)::INTEGER
  INTO 
    _total_views,
    _total_clicks,
    _total_cart_adds,
    _total_purchases,
    _total_bounces,
    _avg_time_on_page_ms
  FROM product_analytics_events
  WHERE product_id = _product_id;
  
  -- Calculate rates
  IF _total_views > 0 THEN
    _bounce_rate := (_total_bounces::FLOAT / _total_views::FLOAT) * 100.0;
    _conversion_rate := (_total_purchases::FLOAT / _total_views::FLOAT) * 100.0;
    _ctr := (_total_clicks::FLOAT / _total_views::FLOAT) * 100.0;
  ELSE
    _bounce_rate := 0.0;
    _conversion_rate := 0.0;
    _ctr := 0.0;
  END IF;
  
  -- Upsert summary
  INSERT INTO product_analytics_summary (
    product_id,
    total_views,
    total_clicks,
    total_cart_adds,
    total_purchases,
    avg_time_on_page_ms,
    bounce_rate,
    conversion_rate,
    ctr,
    last_updated
  ) VALUES (
    _product_id,
    _total_views,
    _total_clicks,
    _total_cart_adds,
    _total_purchases,
    _avg_time_on_page_ms,
    _bounce_rate,
    _conversion_rate,
    _ctr,
    NOW()
  )
  ON CONFLICT (product_id) DO UPDATE SET
    total_views = EXCLUDED.total_views,
    total_clicks = EXCLUDED.total_clicks,
    total_cart_adds = EXCLUDED.total_cart_adds,
    total_purchases = EXCLUDED.total_purchases,
    avg_time_on_page_ms = EXCLUDED.avg_time_on_page_ms,
    bounce_rate = EXCLUDED.bounce_rate,
    conversion_rate = EXCLUDED.conversion_rate,
    ctr = EXCLUDED.ctr,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update summary on event insert
DROP TRIGGER IF EXISTS trigger_update_product_analytics_summary ON product_analytics_events;
CREATE TRIGGER trigger_update_product_analytics_summary
  AFTER INSERT ON product_analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics_summary();

-- Function to calculate ML score
CREATE OR REPLACE FUNCTION calculate_ml_score(p_product_id INTEGER)
RETURNS FLOAT AS $$
DECLARE
  _summary product_analytics_summary%ROWTYPE;
  _max_conversion_rate FLOAT;
  _max_ctr FLOAT;
  _max_revenue FLOAT;
  _max_time FLOAT;
  _revenue FLOAT;
  _ml_score FLOAT;
BEGIN
  -- Get product summary
  SELECT * INTO _summary FROM product_analytics_summary WHERE product_id = p_product_id;
  
  IF NOT FOUND THEN
    RETURN 0.0;
  END IF;
  
  -- Get max values for normalization (using 95th percentile to avoid outliers)
  SELECT 
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY conversion_rate),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ctr),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY avg_time_on_page_ms)
  INTO _max_conversion_rate, _max_ctr, _max_time
  FROM product_analytics_summary
  WHERE conversion_rate > 0 OR ctr > 0;
  
  -- Use defaults if no data
  _max_conversion_rate := COALESCE(_max_conversion_rate, 100.0);
  _max_ctr := COALESCE(_max_ctr, 100.0);
  _max_time := COALESCE(_max_time, 60000.0);
  
  -- Calculate revenue (simplified: purchases * avg_price)
  -- For now, we'll use conversion_rate as proxy for revenue
  _revenue := _summary.conversion_rate;
  _max_revenue := _max_conversion_rate;
  
  -- Normalize values (avoid division by zero)
  IF _max_conversion_rate > 0 THEN
    _summary.conversion_rate := LEAST(_summary.conversion_rate / _max_conversion_rate, 1.0);
  END IF;
  
  IF _max_ctr > 0 THEN
    _summary.ctr := LEAST(_summary.ctr / _max_ctr, 1.0);
  END IF;
  
  IF _max_revenue > 0 THEN
    _revenue := LEAST(_revenue / _max_revenue, 1.0);
  END IF;
  
  IF _max_time > 0 THEN
    _summary.avg_time_on_page_ms := LEAST((_summary.avg_time_on_page_ms::FLOAT / _max_time), 1.0);
  END IF;
  
  -- Calculate ML score (weighted sum)
  _ml_score := (
    _summary.conversion_rate * 0.4 +
    _summary.ctr * 0.2 +
    _revenue * 0.2 +
    _summary.avg_time_on_page_ms * 0.1 +
    (1.0 - LEAST(_summary.bounce_rate / 100.0, 1.0)) * 0.1
  ) * 100.0;
  
  RETURN _ml_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update ML scores for all products
CREATE OR REPLACE FUNCTION update_all_ml_scores()
RETURNS VOID AS $$
DECLARE
  _product_id INTEGER;
BEGIN
  FOR _product_id IN SELECT DISTINCT product_id FROM product_analytics_summary LOOP
    UPDATE product_analytics_summary
    SET ml_score = calculate_ml_score(_product_id)
    WHERE product_id = _product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Allow service role full access to events" ON product_analytics_events FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow service role full access to summary" ON product_analytics_summary FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Allow authenticated users to read summary (for admin panel)
CREATE POLICY "Allow authenticated read summary" ON product_analytics_summary FOR SELECT TO authenticated USING (TRUE);

-- Allow anonymous users to insert events (for tracking)
CREATE POLICY "Allow anonymous insert events" ON product_analytics_events FOR INSERT TO anon WITH CHECK (TRUE);

