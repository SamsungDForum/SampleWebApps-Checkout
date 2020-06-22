# Checkout

This application demonstrates the usage of Checkout API. With this API it is possible to implement in-app purchases.


## How to use the application

Use TV remote controller to navigate.


## Supported platforms

2016 and newer


## Prerequisites

To use Checkout API:

1. ``<script type="text/javascript" src="$WEBAPIS/webapis/webapis.js"></script>`` should be loaded in `index.html`.

2. Developer needs to be in possession of fully configured DPI account.

3. Fill `appId` and `securityKey` properties in `config.js`.

4. Log in to SmartHub on used SmartTV.

## Privileges and metadata

In order to use Checkout API the following privileges must be included in `config.xml`:

```xml
<tizen:privilege name="http://tizen.org/privilege/application.launch" />
<tizen:privilege name="http://developer.samsung.com/privilege/sso.partner" />
<tizen:privilege name="http://developer.samsung.com/privilege/billing" />
```

### File structure

```
Checkout - Checkout sample app root folder
│
├── assets - resources used by this app
│   │
│   └── JosefinSans-Light.ttf - font used in application
│
├── css - styles used in the application
│   │
│   ├── main.css - styles specific for the application
│   └── style.css - style for application's template
│
├── js - scripts used in the application
│   │
│   ├── BasicController.js - module handling all actions concerning basic product types
│   ├── checkoutUtils.js - module with helper methods used in Checkout app
│   ├── config.js - module containing configurations such as `appId` or `securityKey`
│   ├── crypto-js.min.js - library allowing user to hash server requests
│   ├── data.js - module for handling data changes in application
│   ├── DPIService.js - module for communicating with DPI server
│   ├── DynamicClient.js - module for communicating with dynamic server (reponsible for dynamic products)
│   ├── DynamicController.js - module for handling dynamic products related buttons
│   ├── elements.js - module with DOM modifying operations such as creating element
│   ├── init.js - script that runs before any other for setup purpose
│   ├── keyhandler.js - module responsible for handling keydown events
│   ├── logger.js - module allowing user to register logger instances
│   ├── main.js - main application script
│   ├── navigation.js - module responsible for handling in-app focus and navigation
│   ├── SubscriptionController.js - module for handling subscriptions related buttons
│   └── utils.js - module with useful tools used through application
│
├── CHANGELOG.md - changes for each version of application
├── config.xml - application's configuration file
├── icon.png - application's icon
├── index.html - main document
└── README.md - this file
```

## Other resources

*  **Checkout**  
  https://developer.samsung.com/tv/develop/guides/samsung-checkout

*  **Implementing Checkout**  
  https://developer.samsung.com/tv/develop/guides/samsung-checkout/implementing-the-purchase-process


## Copyright and License

**Copyright 2019 Samsung Electronics, Inc.**

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
