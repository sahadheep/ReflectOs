-- V7__diary_fulltext_search.sql
-- Full-text search on diary entries using PostgreSQL tsvector + GIN index.
-- This is the right tool at single-user scale — Elasticsearch would be overkill.

ALTER TABLE diary_entries ADD COLUMN search_vector tsvector;

CREATE INDEX idx_diary_search ON diary_entries USING GIN (search_vector);

-- Trigger to auto-update the search vector on insert/update
CREATE OR REPLACE FUNCTION diary_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.mood, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content_submitted, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content_draft, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diary_search_update
    BEFORE INSERT OR UPDATE ON diary_entries
    FOR EACH ROW EXECUTE FUNCTION diary_search_vector_update();

-- Backfill existing rows
UPDATE diary_entries SET search_vector =
    setweight(to_tsvector('english', COALESCE(mood, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content_submitted, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(content_draft, '')), 'C');
