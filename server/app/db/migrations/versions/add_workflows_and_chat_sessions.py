"""add chat_sessions, workflows, and workflow_runs tables

Revision ID: add_wf_chat
Revises: increase_avatar_url
Create Date: 2026-02-07 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, ENUM


# revision identifiers, used by Alembic.
revision = 'add_wf_chat'
down_revision = 'increase_avatar_url'
branch_labels = None
depends_on = None


def upgrade():
    # =========================================================================
    # Create enum types (if they don't already exist)
    # =========================================================================
    op.execute("DO $$ BEGIN CREATE TYPE workflowstatus AS ENUM ('draft','ready','running','completed','failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE workflowrunstatus AS ENUM ('running','completed','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    # =========================================================================
    # 1. chat_sessions table (IF NOT EXISTS)
    # =========================================================================
    op.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            session_id VARCHAR(100) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
            context_type VARCHAR(50),
            context_id INTEGER,
            context_data JSONB NOT NULL DEFAULT '{}',
            model VARCHAR(50) NOT NULL DEFAULT 'gemini',
            mode VARCHAR(50) NOT NULL DEFAULT 'script',
            message_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_chat_sessions_id ON chat_sessions (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_chat_sessions_user_id ON chat_sessions (user_id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_chat_sessions_session_id ON chat_sessions (session_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_chat_sessions_user_updated ON chat_sessions (user_id, updated_at)")

    # =========================================================================
    # 2. workflows table (IF NOT EXISTS)
    # =========================================================================
    op.execute("""
        CREATE TABLE IF NOT EXISTS workflows (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL DEFAULT 'Untitled Workflow',
            description TEXT,
            graph_data JSONB NOT NULL DEFAULT '{"nodes": [], "connections": []}',
            node_configs JSONB NOT NULL DEFAULT '{}',
            status workflowstatus NOT NULL DEFAULT 'draft',
            last_run_at TIMESTAMP,
            last_run_results JSONB NOT NULL DEFAULT '{}',
            is_template BOOLEAN NOT NULL DEFAULT false,
            template_category VARCHAR(100),
            canvas_state JSONB NOT NULL DEFAULT '{"zoom": 1, "panX": 0, "panY": 0}',
            tags JSONB NOT NULL DEFAULT '[]',
            is_favorite BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflows_id ON workflows (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflows_user_id ON workflows (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflows_user_updated ON workflows (user_id, updated_at)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflows_user_status ON workflows (user_id, status)")

    # =========================================================================
    # 3. workflow_runs table (IF NOT EXISTS)
    # =========================================================================
    op.execute("""
        CREATE TABLE IF NOT EXISTS workflow_runs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            workflow_id INTEGER REFERENCES workflows(id) ON DELETE SET NULL,
            workflow_name VARCHAR(255) NOT NULL,
            run_number INTEGER NOT NULL DEFAULT 1,
            status workflowrunstatus NOT NULL DEFAULT 'running',
            input_graph JSONB NOT NULL DEFAULT '{}',
            node_count INTEGER NOT NULL DEFAULT 0,
            results JSONB NOT NULL DEFAULT '[]',
            final_script TEXT,
            storyboard TEXT,
            credits_used INTEGER NOT NULL DEFAULT 0,
            execution_time_ms INTEGER,
            error_message TEXT,
            started_at TIMESTAMP NOT NULL DEFAULT NOW(),
            completed_at TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflow_runs_id ON workflow_runs (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflow_runs_user_id ON workflow_runs (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflow_runs_workflow_id ON workflow_runs (workflow_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflow_runs_user_started ON workflow_runs (user_id, started_at)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_workflow_runs_workflow ON workflow_runs (workflow_id, started_at)")


def downgrade():
    # Drop tables in reverse order (respect FK dependencies)
    op.execute("DROP TABLE IF EXISTS workflow_runs")
    op.execute("DROP TABLE IF EXISTS workflows")
    op.execute("DROP TABLE IF EXISTS chat_sessions")

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS workflowrunstatus")
    op.execute("DROP TYPE IF EXISTS workflowstatus")
