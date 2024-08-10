class Resource {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }
}

class Inventory {
    constructor() {
        this.resources = [];
        this.loadFromStorage();
        this.updateUI();
    }

    addResource(name, quantity) {
        if (this.getResource(name)) {
            return false;
        }
        this.resources.push(new Resource(name, quantity));
        this.saveToStorage();
        this.updateUI();
        return true;
    }

    useResource(name, quantity) {
        const resource = this.getResource(name);
        if (resource && resource.quantity >= quantity) {
            resource.quantity -= quantity;
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    editResource(name, quantity) {
        const resource = this.getResource(name);
        if (resource) {
            resource.quantity = quantity;
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    removeResource(name) {
        this.resources = this.resources.filter(r => r.name.toLowerCase() !== name.toLowerCase());
        this.saveToStorage();
        this.updateUI();
    }

    getResource(name) {
        return this.resources.find(r => r.name.toLowerCase() === name.toLowerCase());
    }

    updateUI() {
        this.updateResourceList();
        this.updateResourceSelect();
    }

    updateResourceList() {
        const resourceList = document.getElementById('resource-list');
        resourceList.innerHTML = '';
        this.resources.forEach((resource) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${resource.name}: ${resource.quantity}`;
            listItem.onclick = () => this.editResourcePrompt(resource.name);
            resourceList.appendChild(listItem);
        });
    }

    updateResourceSelect() {
        const select = document.getElementById('select-resource');
        select.innerHTML = '<option value="" disabled selected>Select a resource</option>';
        this.resources.forEach((resource, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = resource.name;
            select.appendChild(option);
        });
    }

    editResourcePrompt(name) {
        const newQuantity = prompt('Enter new quantity for ' + name + ':', this.getResource(name).quantity);
        if (newQuantity !== null && this.editResource(name, parseInt(newQuantity))) {
            this.showAlert(`Quantity for ${name} updated to ${newQuantity}.`, 'success');
        } else {
            this.showAlert('Invalid quantity or resource not found.', 'error');
        }
    }

    saveToStorage() {
        localStorage.setItem('resources', JSON.stringify(this.resources));
    }

    loadFromStorage() {
        const savedResources = JSON.parse(localStorage.getItem('resources'));
        if (savedResources) {
            this.resources = savedResources.map(r => new Resource(r.name, r.quantity));
        }
    }

    showAlert(message, type) {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);
        setTimeout(() => alertBox.remove(), 3000);
    }

    filterResources(searchTerm) {
        const resourceList = document.getElementById('resource-list');
        const items = resourceList.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    alertIfLow(resource) {
        const threshold = 10;
        if (resource.quantity <= threshold) {
            this.showAlert(`Warning: ${resource.name} is running low (only ${resource.quantity} left)!`, 'warning');
        }
    }

    automateResourceAdjustment() {
        this.resources.forEach(resource => {
            if (resource.quantity < 5) {
                const additionalQuantity = 10;
                resource.quantity += additionalQuantity;
                this.showAlert(`${resource.name} has been automatically replenished by ${additionalQuantity} units.`, 'success');
            }
        });
        this.updateUI();
    }

    provideGuidance(resourceName) {
        const guidanceText = {
            'Oxygen': 'Ensure oxygen levels are maintained above 50% for crew safety. Regularly check the oxygen generation and consumption rates.',
            'Water': 'Monitor water usage closely to ensure it lasts for the entire mission. Plan water recycling and purification processes.',
            'Food': 'Plan meals efficiently to make the food supply last until the end of the mission. Consider rationing and food preservation techniques.',
            'Power': 'Regularly check power consumption and reserve levels. Manage energy sources effectively to prevent outages.'
        };
        const guidance = guidanceText[resourceName] || 'No specific guidance available for this resource.';
        document.getElementById('guidance-text').textContent = guidance;
    }
}

const inventory = new Inventory();

function addResource() {
    const name = document.getElementById('resource-name').value;
    const quantity = parseInt(document.getElementById('resource-quantity').value);
    if (name && quantity) {
        if (inventory.addResource(name, quantity)) {
            inventory.showAlert(`Resource ${name} added successfully.`, 'success');
        } else {
            inventory.showAlert(`Resource ${name} already exists.`, 'error');
        }
    } else {
        inventory.showAlert('Please enter both resource name and quantity.', 'error');
    }
}

function useResource() {
    const select = document.getElementById('select-resource');
    const resourceIndex = select.value;
    const quantityUsed = parseInt(document.getElementById('usage-quantity').value);
    if (resourceIndex !== '' && quantityUsed) {
        const resourceName = inventory.resources[resourceIndex].name;
        if (inventory.useResource(resourceName, quantityUsed)) {
            inventory.showAlert(`${quantityUsed} units of ${resourceName} used.`, 'success');
            inventory.alertIfLow(inventory.getResource(resourceName));
        } else {
            inventory.showAlert(`Insufficient quantity of ${resourceName} or invalid amount entered.`, 'error');
        }
    } else {
        inventory.showAlert('Please select a resource and enter quantity used.', 'error');
    }
}

document.getElementById('search-input').addEventListener('input', (e) => {
    inventory.filterResources(e.target.value);
});

document.getElementById('select-resource').addEventListener('change', (e) => {
    const resourceName = inventory.resources[e.target.value].name;
    inventory.provideGuidance(resourceName);
});

setInterval(() => {
    inventory.automateResourceAdjustment();
}, 60000);

document.getElementById('health-tab').addEventListener('click', function() {
    window.location.href = 'health.html';
});
