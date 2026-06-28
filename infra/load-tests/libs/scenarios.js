export const userScenarios = {
    CUSTOMER: 'customer',
    DELIVERY_PARTNER: 'delivery_partner',
    RESTAURANT: 'restaurant',
    ADMIN: 'admin',
};

export const userDistribution = {
    [userScenarios.CUSTOMER]: 0.60,
    [userScenarios.DELIVERY_PARTNER]: 0.15,
    [userScenarios.RESTAURANT]: 0.15,
    [userScenarios.ADMIN]: 0.10,
};

export const geographicRegions = [
    { name: 'Mumbai', timezone: 'Asia/Kolkata', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', timezone: 'Asia/Kolkata', lat: 28.6139, lng: 77.2090 },
    { name: 'Bangalore', timezone: 'Asia/Kolkata', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', timezone: 'Asia/Kolkata', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', timezone: 'Asia/Kolkata', lat: 13.0823, lng: 80.2707 },
    { name: 'Pune', timezone: 'Asia/Kolkata', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', timezone: 'Asia/Kolkata', lat: 23.0225, lng: 72.5714 },
    { name: 'Kolkata', timezone: 'Asia/Kolkata', lat: 22.5726, lng: 88.3639 },
];

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function selectUserType() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, probability] of Object.entries(userDistribution)) {
        cumulative += probability;
        if (rand <= cumulative) {
            return type;
        }
    }
    return userScenarios.CUSTOMER;
}

export function generateRestaurantIds(count) {
    const ids = [];
    for (let i = 1; i <= count; i++) {
        ids.push('restaurant-' + i);
    }
    return ids;
}

export const testRestaurantIds = generateRestaurantIds(50);