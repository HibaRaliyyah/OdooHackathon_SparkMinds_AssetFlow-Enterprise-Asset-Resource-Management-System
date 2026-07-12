import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Department from '../models/Department';
import AssetCategory from '../models/AssetCategory';
import Asset from '../models/Asset';
import Booking from '../models/Booking';
import Maintenance from '../models/Maintenance';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI as string;

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'assetflow' });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}),
      AssetCategory.deleteMany({}), Asset.deleteMany({}),
      Booking.deleteMany({}), Maintenance.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Departments
    const departments = await Department.insertMany([
      { name: 'Information Technology', code: 'IT', description: 'Technology & Infrastructure', location: 'Floor 3', budget: 500000 },
      { name: 'Human Resources', code: 'HR', description: 'People & Culture', location: 'Floor 1', budget: 200000 },
      { name: 'Finance', code: 'FIN', description: 'Financial Operations', location: 'Floor 2', budget: 300000 },
      { name: 'Operations', code: 'OPS', description: 'Operations & Logistics', location: 'Floor 4', budget: 400000 },
      { name: 'Marketing', code: 'MKT', description: 'Marketing & Communications', location: 'Floor 2', budget: 250000 },
    ]);
    console.log('🏢 Departments seeded');

    // Categories
    const categories = await AssetCategory.insertMany([
      { name: 'Electronics', code: 'ELEC', description: 'Electronic devices', icon: 'Monitor', color: '#4F46E5', depreciationRate: 25, maintenanceInterval: 180 },
      { name: 'Furniture', code: 'FURN', description: 'Office furniture', icon: 'Armchair', color: '#7C3AED', depreciationRate: 10, maintenanceInterval: 365 },
      { name: 'Vehicles', code: 'VEH', description: 'Company vehicles', icon: 'Car', color: '#10B981', depreciationRate: 15, maintenanceInterval: 90 },
      { name: 'Networking', code: 'NET', description: 'Networking equipment', icon: 'Wifi', color: '#F59E0B', depreciationRate: 20, maintenanceInterval: 365 },
      { name: 'Office Equipment', code: 'OFC', description: 'General office equipment', icon: 'Printer', color: '#EF4444', depreciationRate: 20, maintenanceInterval: 180 },
    ]);
    console.log('📦 Categories seeded');

    // Users - use create() sequentially to trigger pre-save hooks for employeeId
    const userDefs = [
      { firstName: 'System', lastName: 'Admin', email: 'admin@assetflow.com', password: 'Admin@123', role: 'admin', department: departments[0]._id, isEmailVerified: true, phone: '+1-555-0001' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'manager@assetflow.com', password: 'Manager@123', role: 'asset_manager', department: departments[0]._id, isEmailVerified: true, phone: '+1-555-0002' },
      { firstName: 'David', lastName: 'Chen', email: 'head@assetflow.com', password: 'Head@123', role: 'department_head', department: departments[0]._id, isEmailVerified: true, phone: '+1-555-0003' },
      { firstName: 'Maya', lastName: 'Patel', email: 'employee@assetflow.com', password: 'Employee@123', role: 'employee', department: departments[0]._id, isEmailVerified: true, phone: '+1-555-0004' },
      { firstName: 'James', lastName: 'Wilson', email: 'james@assetflow.com', password: 'Employee@123', role: 'employee', department: departments[1]._id, isEmailVerified: true, phone: '+1-555-0005' },
      { firstName: 'Emma', lastName: 'Davis', email: 'emma@assetflow.com', password: 'Employee@123', role: 'employee', department: departments[2]._id, isEmailVerified: true, phone: '+1-555-0006' },
      { firstName: 'Alex', lastName: 'Martinez', email: 'alex@assetflow.com', password: 'Employee@123', role: 'employee', department: departments[3]._id, isEmailVerified: true, phone: '+1-555-0007' },
      { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa@assetflow.com', password: 'Employee@123', role: 'employee', department: departments[4]._id, isEmailVerified: true, phone: '+1-555-0008' },
    ];
    
    const users = [];
    for (const u of userDefs) {
      users.push(await User.create(u));
    }

    // Update department managers
    await Department.findByIdAndUpdate(departments[0]._id, { manager: users[2]._id });
    await Department.findByIdAndUpdate(departments[1]._id, { manager: users[1]._id });
    console.log('👥 Users seeded');

    // Assets
    const assetData = [
      { name: 'MacBook Pro 16"', category: categories[0]._id, department: departments[0]._id, assignedTo: users[3]._id, status: 'allocated', condition: 'excellent', location: 'Floor 3 - Desk A12', serialNumber: 'SN-MBP-001', brand: 'Apple', model: 'MacBook Pro 16" M3', purchaseDate: new Date('2023-06-15'), purchasePrice: 3499, vendor: 'Apple Inc', warrantyExpiry: new Date('2026-06-15'), tags: ['laptop', 'development'] },
      { name: 'Dell UltraSharp Monitor 27"', category: categories[0]._id, department: departments[0]._id, assignedTo: users[3]._id, status: 'allocated', condition: 'good', location: 'Floor 3 - Desk A12', serialNumber: 'SN-MON-001', brand: 'Dell', model: 'U2723QE', purchaseDate: new Date('2023-01-10'), purchasePrice: 750, vendor: 'Dell Technologies', warrantyExpiry: new Date('2026-01-10'), tags: ['monitor', 'display'] },
      { name: 'HP LaserJet Pro', category: categories[4]._id, department: departments[1]._id, status: 'available', condition: 'good', location: 'Floor 1 - Print Room', serialNumber: 'SN-PRN-001', brand: 'HP', model: 'LaserJet Pro M404n', purchaseDate: new Date('2022-03-20'), purchasePrice: 450, vendor: 'HP Inc', warrantyExpiry: new Date('2025-03-20'), tags: ['printer', 'office'] },
      { name: 'Conference Room A', category: categories[1]._id, department: departments[0]._id, status: 'available', condition: 'excellent', location: 'Floor 3 - Room 301', serialNumber: 'SN-CR-001', brand: 'Herman Miller', model: 'Aeron Conference', purchaseDate: new Date('2021-09-01'), purchasePrice: 12000, vendor: 'Herman Miller', tags: ['meeting', 'conference', 'bookable'] },
      { name: 'Toyota Camry 2022', category: categories[2]._id, department: departments[3]._id, status: 'available', condition: 'good', location: 'Parking Lot B', serialNumber: 'SN-CAR-001', brand: 'Toyota', model: 'Camry XSE 2022', purchaseDate: new Date('2022-07-01'), purchasePrice: 28000, vendor: 'Toyota Dealership', warrantyExpiry: new Date('2027-07-01'), tags: ['vehicle', 'car', 'bookable'] },
      { name: 'Cisco Catalyst Switch', category: categories[3]._id, department: departments[0]._id, status: 'available', condition: 'excellent', location: 'Server Room', serialNumber: 'SN-SW-001', brand: 'Cisco', model: 'Catalyst 9300', purchaseDate: new Date('2023-02-14'), purchasePrice: 5000, vendor: 'Cisco Systems', warrantyExpiry: new Date('2028-02-14'), tags: ['networking', 'switch'] },
      { name: 'Epson Projector', category: categories[4]._id, department: departments[4]._id, status: 'available', condition: 'good', location: 'Meeting Room B', serialNumber: 'SN-PRJ-001', brand: 'Epson', model: 'EB-2250U', purchaseDate: new Date('2022-11-20'), purchasePrice: 1200, vendor: 'Epson', warrantyExpiry: new Date('2025-11-20'), tags: ['projector', 'presentation', 'bookable'] },
      { name: 'iPhone 14 Pro', category: categories[0]._id, department: departments[2]._id, assignedTo: users[5]._id, status: 'allocated', condition: 'excellent', location: 'Floor 2', serialNumber: 'SN-IPH-001', brand: 'Apple', model: 'iPhone 14 Pro', purchaseDate: new Date('2022-10-01'), purchasePrice: 1099, vendor: 'Apple Inc', warrantyExpiry: new Date('2024-10-01'), tags: ['phone', 'mobile'] },
      { name: 'Standing Desk - Premium', category: categories[1]._id, department: departments[1]._id, status: 'available', condition: 'good', location: 'Floor 1 - Open Area', serialNumber: 'SN-DSK-001', brand: 'Flexispot', model: 'E7 Pro', purchaseDate: new Date('2023-04-01'), purchasePrice: 650, vendor: 'Flexispot', tags: ['desk', 'furniture'] },
      { name: 'Dell Server R740', category: categories[0]._id, department: departments[0]._id, status: 'under_maintenance', condition: 'fair', location: 'Server Room', serialNumber: 'SN-SRV-001', brand: 'Dell', model: 'PowerEdge R740', purchaseDate: new Date('2020-01-15'), purchasePrice: 15000, vendor: 'Dell Technologies', warrantyExpiry: new Date('2024-01-15'), tags: ['server', 'infrastructure'] },
    ];
    
    const assets = [];
    for (const a of assetData) {
      assets.push(await Asset.create(a));
    }
    console.log('💼 Assets seeded');

    // Bookings
    const now = new Date();
    const bookingData = [
      {
        asset: assets[3]._id, bookedBy: users[3]._id, department: departments[0]._id,
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        purpose: 'Team standup meeting', status: 'approved',
        approvedBy: users[1]._id, approvedAt: new Date(),
      },
      {
        asset: assets[4]._id, bookedBy: users[6]._id, department: departments[3]._id,
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
        purpose: 'Client site visit', status: 'pending',
      },
    ];
    for (const b of bookingData) {
      await Booking.create(b);
    }
    console.log('📅 Bookings seeded');

    // Maintenance
    const maintenanceData = [
      {
        asset: assets[9]._id, reportedBy: users[1]._id,
        type: 'corrective', priority: 'high', status: 'in_progress',
        description: 'Server not booting properly, possible disk failure',
        diagnosis: 'RAID controller failure detected',
        estimatedCost: 800,
        approvedBy: users[0]._id, approvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        startedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        asset: assets[0]._id, reportedBy: users[3]._id,
        type: 'corrective', priority: 'medium', status: 'pending',
        description: 'Battery draining fast, needs replacement',
        estimatedCost: 200,
      },
      {
        asset: assets[2]._id, reportedBy: users[4]._id,
        type: 'preventive', priority: 'low', status: 'approved',
        description: 'Annual printer maintenance check',
        estimatedCost: 100,
        approvedBy: users[1]._id, approvedAt: new Date(),
      },
    ];
    for (const m of maintenanceData) {
      await Maintenance.create(m);
    }
    console.log('🔧 Maintenance records seeded');

    // Notifications
    const notificationData = [
      { recipient: users[3]._id, title: 'Booking Confirmed', message: 'Your conference room booking for today has been approved.', type: 'success', category: 'booking' },
      { recipient: users[3]._id, title: 'Maintenance Reminder', message: 'Your MacBook Pro battery maintenance request is pending.', type: 'warning', category: 'maintenance' },
      { recipient: users[1]._id, title: 'New Maintenance Request', message: 'A new maintenance request has been raised for Dell Server R740.', type: 'info', category: 'maintenance' },
      { recipient: users[0]._id, title: 'Audit Due', message: 'Q4 asset audit is scheduled for next week.', type: 'warning', category: 'audit' },
    ];
    for (const n of notificationData) {
      await Notification.create(n);
    }
    console.log('🔔 Notifications seeded');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Default Login Credentials:');
    console.log('  Admin:         admin@assetflow.com / Admin@123');
    console.log('  Asset Manager: manager@assetflow.com / Manager@123');
    console.log('  Dept. Head:    head@assetflow.com / Head@123');
    console.log('  Employee:      employee@assetflow.com / Employee@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
