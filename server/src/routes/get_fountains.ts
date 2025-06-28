import * as https from "https";
import { Request, Response } from "express";
import { IncomingMessage } from "http";

// Type definitions for the API responses
interface Resource {
    id: string;
    name: string;
    description: string;
    datastore_active: boolean;
}

interface PackageData {
    id: string;
    name: string;
    notes: string;
    resources: Resource[];
}

interface DatastoreResponse {
    records: any[];
}

interface ResourceWithData {
    resourceId: string;
    resourceName: string;
    resourceDescription: string;
    data: any[];
}

interface AllPackageData {
    packageId: string;
    packageName: string;
    packageDescription: string;
    resources: ResourceWithData[];
}

// Generic function to make HTTPS requests
const makeRequest = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        https.get(url, (response: IncomingMessage) => {
            let dataChunks: Buffer[] = [];
            response
                .on("data", (chunk: Buffer) => {
                    dataChunks.push(chunk);
                })
                .on("end", () => {
                    try {
                        const data = Buffer.concat(dataChunks);
                        const jsonData = JSON.parse(data.toString());
                        resolve(jsonData.result);
                    } catch (error) {
                        reject(error);
                    }
                })
                .on("error", (error: Error) => {
                    reject(error);
                });
        });
    });
};

// Main function to get all data from a Toronto Open Data package
async function getAllPackageData(packageId: string): Promise<AllPackageData> {
    try {
        // Get package metadata
        const packageUrl = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${packageId}`;
        const packageData = await makeRequest(packageUrl) as PackageData;
        
        // Filter to get only datastore-active resources
        const datastoreResources = packageData.resources.filter((r: Resource) => r.datastore_active);
        
        if (datastoreResources.length === 0) {
            throw new Error("No datastore resources found for this package");
        }
        
        // Get data from all datastore resources
        const allResourceData: ResourceWithData[] = await Promise.all(
            datastoreResources.map(async (resource: Resource): Promise<ResourceWithData> => {
                const resourceUrl = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?id=${resource.id}&limit=10000`;
                const resourceData = await makeRequest(resourceUrl) as DatastoreResponse;
                
                return {
                    resourceId: resource.id,
                    resourceName: resource.name,
                    resourceDescription: resource.description,
                    data: resourceData.records
                };
            })
        );
        
        return {
            packageId: packageData.id,
            packageName: packageData.name,
            packageDescription: packageData.notes,
            resources: allResourceData
        };
        
    } catch (error: any) {
        throw new Error(`Failed to fetch package data: ${error.message}`);
    }
}

// Express route handler for getting fountains data
const getFountains = async (req: Request, res: Response): Promise<void> => {
    try {
        const packageId = "f614d4d3-594a-4f78-8473-faaa17269c67"; // Toronto fountains package ID
        
        const data = await getAllPackageData(packageId);
        
        // Send the data as JSON response
        res.json({
            success: true,
            message: "Fountains data retrieved successfully",
            data: data
        });
        
    } catch (error: any) {
        console.error("Error fetching fountains data:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch fountains data",
            error: error.message
        });
    }
};

// Alternative route handler that accepts package ID as parameter
const getPackageData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { packageId } = req.params;
        
        if (!packageId) {
            res.status(400).json({
                success: false,
                message: "Package ID is required"
            });
            return;
        }
        
        const data = await getAllPackageData(packageId);
        
        res.json({
            success: true,
            message: "Package data retrieved successfully",
            data: data
        });
        
    } catch (error: any) {
        console.error("Error fetching package data:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch package data",
            error: error.message
        });
    }
};

// Export the route handlers
export { getFountains, getPackageData, getAllPackageData };