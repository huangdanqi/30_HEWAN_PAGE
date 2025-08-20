# Excel Import Guide for Device Management

## Overview
The device import functionality allows users to upload Excel files (.xlsx, .xls) containing device information and automatically import them into the system. The system will map the Excel columns to the database fields and add the selected device model, production batch, manufacturer, and creator information.

## Excel File Structure

### Required Columns
Your Excel file should contain the following columns (in any order):

| Column Name (Chinese) | Column Name (English) | Description | Required |
|----------------------|----------------------|-------------|----------|
| 设备ID | Device ID | Unique device identifier | ✅ Yes |
| 绑定子账户 | Bound Sub-account | Sub-account binding information | ❌ No |
| 初始烧录固件 | Initial Burned Firmware | Initial firmware version | ❌ No |
| 最新可更新固件 | Latest Updatable Firmware | Latest available firmware | ❌ No |
| 当前固件版本 | Current Firmware Version | Current running firmware | ❌ No |
| SN码 | SN Code | Serial number code | ❌ No |
| 芯片ID | Chip ID | Device chip identifier | ❌ No |
| Wi-Fi MAC地址 | Wi-Fi MAC Address | Wi-Fi interface MAC address | ❌ No |
| 蓝牙MAC地址 | Bluetooth MAC Address | Bluetooth interface MAC address | ❌ No |
| 蓝牙名称 | Bluetooth Name | Bluetooth device name | ❌ No |
| 蜂窝网络识别码 | Cellular Network ID | Cellular network identifier | ❌ No |
| 4G卡号 | 4G Card Number | 4G SIM card number | ❌ No |
| CPU序列号 | CPU Serial Number | CPU serial identifier | ❌ No |

### Form Fields (Automatically Added)
When importing, the system will automatically add these fields from the form selection:

- **设备型号 (Device Model)**: Selected from dropdown
- **生产批次 (Production Batch)**: Selected from dropdown  
- **生产厂家 (Manufacturer)**: Selected from dropdown
- **创建人 (Creator)**: Automatically set to current user name

## Import Process

### Step 1: Select Basic Information
1. Choose **设备型号** (Device Model)
2. Choose **生产批次** (Production Batch)
3. Choose **生产厂家** (Manufacturer)

### Step 2: Upload Excel File
1. Click the upload area or drag & drop your Excel file
2. Supported formats: .xlsx, .xls
3. Maximum file size: 50MB
4. The system will automatically parse the file and validate the structure

### Step 3: Processing
- The system reads the Excel file
- Maps Chinese column headers to database fields
- Validates required data (Device ID)
- Sends data to the server for import
- Updates existing devices or creates new ones

## Data Mapping

The system automatically maps Excel columns to database fields:

```javascript
// Example mapping
{
  '设备ID': 'deviceId',
  '绑定子账户': 'boundSubAccount', 
  '初始烧录固件': 'initialFirmware',
  '最新可更新固件': 'latestFirmware',
  '当前固件版本': 'currentFirmwareVersion',
  'SN码': 'serialNumberCode',
  '芯片ID': 'chipId',
  'Wi-Fi MAC地址': 'wifiMacAddress',
  '蓝牙MAC地址': 'bluetoothMacAddress',
  '蓝牙名称': 'bluetoothName',
  '蜂窝网络识别码': 'cellularNetworkId',
  '4G卡号': 'fourGCardNumber',
  'CPU序列号': 'cpuSerialNumber'
}
```

## Error Handling

The system will show errors for:
- Missing required columns
- Invalid file format
- File size exceeding 50MB
- Empty device ID values
- Server connection issues

## Success Response

On successful import, you'll see:
- Total number of devices processed
- Number of devices created/updated
- Any errors encountered
- Automatic refresh of the device list

## Notes

- **Duplicate Handling**: If a device with the same Device ID already exists, it will be updated with new information
- **Data Validation**: Only rows with valid Device ID values will be processed
- **Transaction Safety**: All imports are wrapped in database transactions for data integrity
- **User Tracking**: The creator field is automatically populated with the current user's name
