/**
 * Utility to export table data as CSV files
 */
export const exportToCSV = (data, filename = 'aicte_export.csv', columns = null) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Determine headers
  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = keys.map(key => {
      let val = row[key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      // Clean string, escape quotes
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
