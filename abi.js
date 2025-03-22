const abi=[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_certifier",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addCertifier",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_inspector",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addInspector",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "certifyProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_storeId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_storeName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_storeLocation",
				"type": "string"
			}
		],
		"name": "createStore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_certifier",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addCertifier",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_inspector",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addInspector",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "certifyProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_storeId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_storeName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_storeLocation",
				"type": "string"
			}
		],
		"name": "createStore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "certifierAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CertifierAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_productName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_storeId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_seedType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_sowingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_harvestingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_packagingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_expirationDate",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_certifierAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_certifierImageCid",
				"type": "string"
			}
		],
		"name": "createProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "inspectorAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "InspectorAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "certifier",
				"type": "address"
			}
		],
		"name": "ProductCertified",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "productName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "storeId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "inspector",
				"type": "address"
			}
		],
		"name": "ProductCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "storeId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "storeName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cid",
				"type": "string"
			}
		],
		"name": "StoreCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "certifiers",
		"outputs": [
			{
				"internalType": "address",
				"name": "certifierAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "certifierToProducts",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_productId",
				"type": "string"
			}
		],
		"name": "getProductDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "productId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "productName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "storeName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "seedType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "sowingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "harvestingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "packagingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "expirationDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "inspectorName",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isCertified",
						"type": "bool"
					},
					{
						"internalType": "string",
						"name": "certifierName",
						"type": "string"
					}
				],
				"internalType": "struct EcoLand.ProductDetail",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_certifierAddress",
				"type": "address"
			}
		],
		"name": "getProductsByCertifier",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "productId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "productName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "storeName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "seedType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "sowingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "harvestingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "packagingDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "expirationDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "inspectorName",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isCertified",
						"type": "bool"
					},
					{
						"internalType": "string",
						"name": "certifierName",
						"type": "string"
					}
				],
				"internalType": "struct EcoLand.ProductDetail[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "inspectors",
		"outputs": [
			{
				"internalType": "address",
				"name": "inspectorAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "productList",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "productName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "storeId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "seedType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "sowingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "harvestingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "packagingDate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "expirationDate",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "inspectorAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "certifierAddress",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isCertified",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "certifierImageCid",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "productToStore",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "stores",
		"outputs": [
			{
				"internalType": "string",
				"name": "storeId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "storeName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "storeLocation",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "superAdmin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
export default abi;