import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { Vehicle } from '../types/vehicle.types';

const vehicleService = new VehicleService();

// Create a new vehicle
export const createVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleData: Vehicle = req.body;
        const newVehicle = await vehicleService.createVehicle(vehicleData);
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vehicle', error });
    }
};

// Get all vehicles
export const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error });
    }
};

// Get a vehicle by ID
export const getVehicleById = async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.id;
        const vehicle = await vehicleService.getVehicleById(vehicleId);
        if (vehicle) {
            res.status(200).json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle', error });
    }
};

// Update a vehicle
export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.id;
        const vehicleData: Vehicle = req.body;
        const updatedVehicle = await vehicleService.updateVehicle(vehicleId, vehicleData);
        if (updatedVehicle) {
            res.status(200).json(updatedVehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error });
    }
};

// Delete a vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.id;
        const deletedVehicle = await vehicleService.deleteVehicle(vehicleId);
        if (deletedVehicle) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error });
    }
};