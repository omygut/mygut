import { createRecordService } from "./base";
import type { ImagingRecord } from "../types";

export const imagingService = createRecordService<ImagingRecord>("imaging_records");
