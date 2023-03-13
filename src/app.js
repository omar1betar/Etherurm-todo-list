const web3 = require("web3");
App = {
    contracts: {},
    loading: false,

    load: async () => {
        await App.loadWeb3();
        await App.loadAccounts();
        await App.loadContract();
        await App.render();
    },
   
      // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
         window.addEventListener('load', async () => {
        // Modern dapp browsers...
        console.log("load");

            if (window.ethereum) {
                 window.web3 = require("web3");
                console.log("web3",web3);
                 window.web3 = new Web3(ethereum);
                 console.log("ethereum",ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                // Accounts now exposed
                web3.eth.sendTransaction({/* ... */});
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            console.log("legacy....")

            window.web3 = new Web3(web3.currentProvider);
            // Accounts always exposed
            web3.eth.sendTransaction({/* ... */});
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
        });
    },

    loadAccounts: async () => {
        // connect to all the accounts, we want index 0 since, its the first account
        // the account we are connected to
        //web3.eth.defaultAccount = web3.eth.accounts[0];
        App.account = await ethereum.request({ method: 'eth_accounts' });
        console.log(App.account);
    },

    loadContract: async () =>{
        const todoList = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
        App.todoList = await App.contracts.TodoList.deployed();
    },

    render: async () => {
        if (App.loading) {
            return;
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
        },


    renderTasks: async () => {
        // load all the tasks from the blockchain
        const taskCount = await App.todoList.taskCount();
        const $tackTemplate = $(".taskTemplate");

        // render each of the tasks
        for (var i = 1; i <= taskCount; i++){
            const task = await App.todoList.tasks(i);
            const task_id = task[0].toNumber();
            const task_content = task[1];
            const task_completed = task[2];

            // Create the html for the task
            const $newTaskTemplate = $tackTemplate.clone()
            $newTaskTemplate.find('.content').html(task_content)
            $newTaskTemplate.find('input')
                            .prop('name', task_id)
                            .prop('checked', task_completed)
                            .on('click', App.toggleCompleted)
    
            // Put the task in the correct list
            if (task_completed) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }
    
            // Show the task
            $newTaskTemplate.show()
        }

    },


    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    },


    createTask: async () => {
        App.setLoading(true);
        const content = $('#newTask').val();
        await App.todoList.createTask(content, { from: App.account[0] });
        window.location.reload();
    },


    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId, {from: App.account})
        window.location.reload()
    },


      
}

$(() => {
    $(window).load(() => {
        App.load();
    })
})