export interface DBApplication {
  id: string;
  programName: string;
  status: string;
  createdAt: string;
  internId?: string;
  certificateIssued?: boolean | number;
  details?: string;
}

export interface OfferFields {
  department: string;
  startDate: string;
  endDate: string;
  duration: string;
  mode: string;
  internshipMode: string;
  supervisor: string;
}

export interface DocumentData {
  application: DBApplication;
  internName: string;
  offerFields: OfferFields;
}