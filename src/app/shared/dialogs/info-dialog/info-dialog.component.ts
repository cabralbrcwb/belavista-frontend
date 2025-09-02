import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface InfoDialogData {
  title?: string;
  message: string;
  okText?: string;
}

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Informação' }}</h2>
    <div mat-dialog-content>
      <pre style="white-space: pre-wrap; font-family: inherit;">{{ data.message }}</pre>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="close()">{{ data.okText || 'OK' }}</button>
    </div>
  `
})
export class InfoDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<InfoDialogComponent, void>,
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData
  ) {}

  close() {
    this.dialogRef.close();
  }
}
