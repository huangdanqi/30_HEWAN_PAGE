-- Create the product list table based on the image description
CREATE TABLE IF NOT EXISTS product_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    ip_role VARCHAR(50) NOT NULL,
    product_model VARCHAR(100) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(200) NOT NULL,
    color VARCHAR(100) NOT NULL,
    production_batch DATE NOT NULL,
    manufacturer VARCHAR(200) NOT NULL,
    qr_code_file_directory TEXT NOT NULL,
    qr_code_exported ENUM('是', '否') DEFAULT '否',
    barcode_file_directory TEXT NOT NULL,
    barcode_exported ENUM('是', '否') DEFAULT '否',
    device_id VARCHAR(100) NOT NULL,
    sub_account_id VARCHAR(100) NOT NULL,
    file_export_time DATETIME NOT NULL,
    first_binding_time DATETIME NOT NULL,
    creator_id INT NOT NULL,
    creation_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_product_id ON product_list(product_id);
CREATE INDEX idx_product_model ON product_list(product_model);
CREATE INDEX idx_product_name ON product_list(product_name);
CREATE INDEX idx_device_id ON product_list(device_id);
CREATE INDEX idx_creation_time ON product_list(creation_time);
CREATE INDEX idx_update_time ON product_list(update_time); 