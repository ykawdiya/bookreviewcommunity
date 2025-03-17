/**
 * Utility to check for required environment variables
 */

export const checkEnvironmentVariables = () => {
    const requiredVars = [
        'REACT_APP_API_URL',
        'REACT_APP_GOOGLE_CLIENT_ID'
    ];

    const missing = requiredVars.filter(varName => {
        const value = process.env[varName];
        return !value || value.trim() === '';
    });

    if (missing.length > 0) {
        console.warn('⚠️ Missing environment variables:');
        missing.forEach(variable => {
            console.warn(`  - ${variable}`);
        });
        console.warn('Please check your .env file or environment configuration.');
        return false;
    }

    console.log('✅ All required environment variables are present');
    return true;
};

export const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5001';
};

export const getGoogleClientId = () => {
    return process.env.REACT_APP_GOOGLE_CLIENT_ID;
};