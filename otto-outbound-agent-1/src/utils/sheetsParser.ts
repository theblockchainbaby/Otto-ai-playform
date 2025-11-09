import { GoogleSpreadsheet } from 'google-spreadsheet';

export class SheetsParser {
  private doc: GoogleSpreadsheet;

  constructor(sheetId: string) {
    this.doc = new GoogleSpreadsheet(sheetId);
  }

  async loadCredentials(credentials: any) {
    await this.doc.useServiceAccountAuth(credentials);
    await this.doc.loadInfo();
  }

  async getSheetData(sheetName: string): Promise<any[]> {
    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet with name ${sheetName} not found`);
    }
    const rows = await sheet.getRows();
    return rows.map(row => row._rawData);
  }

  async updateSheetData(sheetName: string, data: any[]) {
    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet with name ${sheetName} not found`);
    }
    await sheet.addRows(data);
  }

  async clearSheet(sheetName: string) {
    const sheet = this.doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet with name ${sheetName} not found`);
    }
    await sheet.clear();
  }
}