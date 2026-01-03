import fs from 'fs';
import path from 'path';
import { encryptData } from './utils/encryption.js';

const loansFilePath = path.join(process.cwd(), 'all_loans.json');

// Get password from command line arguments
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument:');
  console.error('node encrypt-loans.js yourPassword');
  process.exit(1);
}

try {
  // Read the current loans file
  if (!fs.existsSync(loansFilePath)) {
    console.error(`File not found: ${loansFilePath}`);
    process.exit(1);
  }

  const jsonData = fs.readFileSync(loansFilePath, 'utf8');
  
  // Validate it's valid JSON
  try {
    JSON.parse(jsonData);
  } catch (e) {
    console.error('Current file is not valid JSON');
    process.exit(1);
  }

  // Encrypt the data
  const encryptedData = encryptData(jsonData, password);
  
  // Create a backup of the original file
  const backupPath = loansFilePath + '.backup';
  fs.copyFileSync(loansFilePath, backupPath);
  console.log(`✓ Backup created: ${backupPath}`);
  
  // Write encrypted data to the loans file
  fs.writeFileSync(loansFilePath, encryptedData);
  console.log(`✓ File encrypted successfully: ${loansFilePath}`);
  console.log(`\nIMPORTANT: Remember your password! It's required to access the loans data.`);
  console.log(`Password: ${password}`);
  
} catch (error) {
  console.error('Error during encryption:', error.message);
  process.exit(1);
}
