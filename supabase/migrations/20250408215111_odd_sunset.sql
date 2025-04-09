/*
  # Initial Schema Setup for DocParser

  1. Tables
    - organizations
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
      
    - users
      - id (uuid, primary key, references auth.users)
      - email (text)
      - organization_id (uuid, references organizations)
      - role (text)
      - created_at (timestamp)
      
    - onboarding_details
      - id (uuid, primary key)
      - organization_id (uuid, references organizations)
      - fleet_size (integer)
      - vehicle_types (text[])
      - current_vehicle_models (text[])
      - preferred_manufacturers (text[])
      - energy_cost_per_kwh (decimal)
      - department (text)
      - created_at (timestamp)
      
    - documents
      - id (uuid, primary key)
      - organization_id (uuid, references organizations)
      - user_id (uuid, references users)
      - title (text)
      - content (text)
      - original_content (text)
      - file_type (text)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access
*/

-- Create organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL,
  organization_id uuid REFERENCES organizations,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);

-- Create onboarding_details table
CREATE TABLE onboarding_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  fleet_size integer NOT NULL,
  vehicle_types text[] NOT NULL,
  current_vehicle_models text[] NOT NULL,
  preferred_manufacturers text[] NOT NULL,
  energy_cost_per_kwh decimal NOT NULL,
  department text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  user_id uuid REFERENCES users NOT NULL,
  title text NOT NULL,
  content text,
  original_content text NOT NULL,
  file_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Create policies for users
CREATE POLICY "Users can view members of their organization"
  ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Create policies for onboarding_details
CREATE POLICY "Users can view their organization's onboarding details"
  ON onboarding_details
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their organization's onboarding details"
  ON onboarding_details
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Create policies for documents
CREATE POLICY "Users can view their organization's documents"
  ON documents
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );