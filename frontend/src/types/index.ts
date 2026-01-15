// Core data types
export interface Site {
  id: number;
  name: string;
  contact_person?: string;
  contact_number?: string;
  contact_email?: string;
  coordinates?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteDetail extends Site {
  staff_count: number;
  meeting_count: number;
}

export interface Staff {
  id: number;
  name: string;
  surname?: string;
  role?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffDetail extends Staff {
  site_count: number;
}

export interface CreateStaffInput {
  name: string;
  surname?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface UpdateStaffInput {
  name?: string;
  surname?: string;
  role?: string;
  email?: string;
  phone?: string;
}
export interface MeetingItem {
  id?: number;
  meeting_id?: number;
  issue_discussed: string;
  person_responsible_staff_id?: number;
  responsible_staff_ids?: number[];
  responsible_staff?: Array<{ id: number; name: string; surname: string }>;
  target_date?: string;
  invoice_date?: string;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Meeting {
  id: number;
  site_id: number;
  agenda?: string;
  attendees?: string;
  apologies?: string;
  chairperson_staff_id?: number;
  introduction?: string;
  scheduled_at?: string;
  items: MeetingItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateSiteInput {
  name: string;
  contact_person?: string;
  contact_number?: string;
  contact_email?: string;
  coordinates?: string;
}

export interface UpdateSiteInput {
  name?: string;
  contact_person?: string;
  contact_number?: string;
  contact_email?: string;
  coordinates?: string;
}

export interface CreateStaffInput {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface UpdateStaffInput {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface CreateMeetingInput {
  site_id: number;
  agenda?: string;
  attendees?: string;
  apologies?: string;
  chairperson_staff_id?: number;
  introduction?: string;
  scheduled_at?: string;
  items: MeetingItem[];
}

export interface UpdateMeetingInput {
  agenda?: string;
  attendees?: string;
  apologies?: string;
  chairperson_staff_id?: number;
  introduction?: string;
  scheduled_at?: string;
  items?: MeetingItem[];
}
// Contract types
export type ContractType = 'Supply' | 'Service';
export type ContractStatus = 'Active' | 'Expired' | 'Completed' | 'Cancelled';

export interface Contract {
  id: number;
  contract_type: ContractType;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  site_id: number;
  responsible_staff_id: number;
  eskom_reference?: string;
  contact_person_name?: string;
  contact_person_telephone?: string;
  contact_person_email?: string;
  internal_quotation_number?: string;
  internal_invoice_number?: string;
  contract_value?: number;
  notes?: string;
  document_filename?: string;
  document_path?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractDetail extends Contract {
  site_name?: string;
  responsible_staff_name?: string;
  responsible_staff_surname?: string;
}

export interface CreateContractInput {
  contract_type: ContractType;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  site_id: number;
  responsible_staff_id: number;
  eskom_reference?: string;
  contact_person_name?: string;
  contact_person_telephone?: string;
  contact_person_email?: string;
  contract_value?: number;
  notes?: string;
}

export interface UpdateContractInput {
  contract_type?: ContractType;
  start_date?: string;
  end_date?: string;
  status?: ContractStatus;
  site_id?: number;
  responsible_staff_id?: number;
  eskom_reference?: string;
  contact_person_name?: string;
  contact_person_telephone?: string;
  contact_person_email?: string;
  contract_value?: number;
  notes?: string;
}

export interface ContractSummary {
  total_contracts: number;
  active_count: number;
  expired_count: number;
  completed_count: number;
  cancelled_count: number;
  overdue_count: number;
}

// Vehicle/Fleet Management Types
export type VehicleType = 'Bakkie / LDV' | 'SUV / XUV' | 'Sedan' | 'Hatchback' | 'Minibus / Stationwagon' | 'Trailer';
export type PrimaryUse = 'Delivery' | 'Sales' | 'Executive' | 'Pool Vehicle' | 'Service';

export interface Vehicle {
  vehicle_registration_plate: string;
  make: string;
  model: string;
  engine_displacement?: string;
  description?: string;
  year: number;
  vin_chassis_number?: string;
  vehicle_type: VehicleType;
  colour?: string;
  purchase_date?: string;
  active_tracking: boolean;
  assigned_staff_id?: number;
  primary_use: PrimaryUse;
  license_renewal_date?: string;
  general_notes?: string;
  natis_document?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleDetail extends Vehicle {
  assigned_staff_name?: string;
  assigned_staff_surname?: string;
}

export interface CreateVehicleInput {
  vehicle_registration_plate: string;
  make: string;
  model: string;
  engine_displacement?: string;
  description?: string;
  year: number;
  vin_chassis_number?: string;
  vehicle_type: VehicleType;
  colour?: string;
  purchase_date?: string;
  active_tracking: boolean;
  assigned_staff_id?: number;
  primary_use: PrimaryUse;
  license_renewal_date?: string;
  general_notes?: string;
  natis_document?: string;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  engine_displacement?: string;
  description?: string;
  year?: number;
  vin_chassis_number?: string;
  vehicle_type?: VehicleType;
  colour?: string;
  purchase_date?: string;
  active_tracking?: boolean;
  assigned_staff_id?: number;
  primary_use?: PrimaryUse;
  license_renewal_date?: string;
  general_notes?: string;
  natis_document?: string;
}