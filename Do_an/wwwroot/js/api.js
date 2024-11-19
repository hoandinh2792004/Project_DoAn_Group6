document.addEventListener('DOMContentLoaded', async () => {
    apiEndpointUsers = 'https://659a6480652b843dea538305.mockapi.io/users'; // Assign apiEndpointUsers here
    const apiEndpointProducts = 'https://659a6480652b843dea538305.mockapi.io/Product';

    try {
        const usersResponse = await fetch(apiEndpointUsers);
        const productsResponse = await fetch(apiEndpointProducts);

        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();

    } catch (error) {
        console.error('Error fetching API data:', error);
    }
});