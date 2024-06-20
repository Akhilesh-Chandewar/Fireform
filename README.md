# Fireform



## Project Description

Fireform is a Terraform-based project designed to provision and manage Firebase infrastructure. It automates the deployment of a Firebase project, including Firestore databases, Cloud Storage buckets, Hosting sites, and optionally, Authentication setup. The goal is to provide a modular and maintainable Terraform configuration that ensures an idempotent and repeatable deployment process.

## Features

### 1. Terraform Configuration
- **Provision and Manage Firebase Infrastructure**: Write Terraform configuration files to set up Firebase projects, including:
  - Firebase project
  - Firestore database
  - Cloud Storage bucket
  - Hosting site
  - Optional Authentication setup
- **Modular and Maintainable Structure**: Organize the Terraform code into reusable modules for ease of maintenance and scalability.

### 2. Deployment Automation
- **Automated Deployment**: Configure Terraform to deploy the Firebase infrastructure and web application automatically.
- **Idempotent Deployment Process**: Ensure the deployment process is idempotent, allowing safe and repeatable executions.

## Getting Started

### Prerequisites
- Terraform installed on your local machine
- Firebase CLI installed and authenticated
- Google Cloud CLI (gCloud CLI) installed and authenticated
- A terminal/console
- An IDE/text editor (WebStorm, Atom, Sublime, VS Code, etc.)
- A web browser (Chrome, etc.)
- npm and Node.js installed

### Installation

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/Akhilesh-Chandewar/Fireform.git
    cd Fireform
    ```

2. **Initialize Terraform**:
    ```sh
    terraform init
    ```

3. **Configure Terraform Variables**:
    - Edit the `variables.tf` file to set your Firebase project details.

4. **Apply Terraform Configuration**:
    ```sh
    terraform apply
    ```

## Creating a Terraform Configuration

### Terraform Set Up
1. In the codebase of the downloaded sample app, navigate to the root of the `web` directory.
2. At the root of that directory, create a Terraform config file called `main.tf` with the following initial setup:

    ```hcl
    # Terraform configuration to set up providers by version.
    terraform {
      required_providers {
        google-beta = {
          source  = "hashicorp/google-beta"
          version = "~> 4.0"
        }
      }
    }

    # Configure the provider not to use the specified project for quota check.
    # This provider should only be used during project creation and initializing services.
    provider "google-beta" {
      alias                 = "no_user_project_override"
      user_project_override = false
    }

    # Configure the provider that uses the new project's quota.
    provider "google-beta" {
      user_project_override = true
    }
    ```

    **Note**: When you start using Terraform with Firebase on your own, you can include this initial setup in a separate Terraform config file (such as `provider.tf`) apart from `main.tf`.

    Each of the `google-beta` providers has an attribute named `user_project_override` that determines how the operations from Terraform will be quota checked. For provisioning most resources, you should use `user_project_override = true`, which means to check quota against your own Firebase project. However, to set up your new project so that it can accept quota checks, you first need to use `user_project_override = false`. The Terraform alias syntax allows you to distinguish between the two provider setups in the next steps of this codelab.

### Initialize Terraform in the Directory
Creating a new config for the first time requires downloading the provider specified in the configuration. To do this initialization, run the following command from the root of the same directory as your `main.tf` config file:

```sh
terraform init
```

## Creating a Firebase Project via Terraform

### Add Blocks for the Underlying Google Cloud Project and APIs
**Note**: For the next two sub-steps, use the provider with the alias `no_user_project_override` because in these sub-steps you're actually creating the project that will eventually be used for quota-checks.

#### Provision the Underlying Google Cloud Project
Add the following resource block to your `main.tf` config file. You need to specify your own project name (like "Fireform Project") and your own project ID (like "fireform-project-id"). 

```hcl
# Create a new Google Cloud project.
resource "google_project" "default" {
  provider = google-beta.no_user_project_override

  name       = "fireform109"
  project_id = "fireform109-013"
  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}
```

#### Enable the Required Underlying APIs
Next, enable the required underlying APIs: the Service Usage API and Firebase Management API. Add the following resource blocks to your `main.tf` config file:

```hcl
# Enable the required underlying Service Usage API.
resource "google_project_service" "serviceusage" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "serviceusage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable the required underlying Firebase Management API.
resource "google_project_service" "firebase" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "firebase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}
```

### Add a Block to Enable Firebase Services
Enable Firebase services on the project. Add the following resource block to your `main.tf` config file:

```hcl
# Enable Firebase services for the new project created above.
resource "google_firebase_project" "default" {
  provider = google-beta

  project = google_project.default.project_id

  # Wait until the required APIs are enabled.
  depends_on = [
    google_project_service.firebase,
    google_project_service.serviceusage,
  ]
}
```

The `depends_on` clause tells Terraform to wait for the underlying APIs to be enabled before proceeding.

### Apply the Configuration
To provision the new resources and enable the APIs specified in your config file, run the following command from the root of the same directory as your `main.tf` file:

```sh
terraform apply
```

In the terminal, Terraform prints a plan of actions it will perform. If everything looks as expected, approve the actions by entering `yes`.

## Registering Your Firebase App via Terraform

### Add a Block to Register the Web App
To register your web app in your Firebase project, append your `main.tf` file with the following resource block. Specify your own `display_name` for your web app. Note that this name is only used within Firebase interfaces and isn't visible to end-users.

```hcl
# Create a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "default" {
  provider = google-beta

  project      = google_firebase_project.default.project
  display_name = "fireform109"
  deletion_policy = "DELETE"
}
```

### Apply the Configuration
To provision the new resource, run the following command from the root of the same directory as your `main.tf` file:

```sh
terraform apply
```

Note that this command won't re-create a new Google Cloud project. Terraform will detect that a project with the specified project ID already exists and will compare the current state of the project with what's in the `.tf` file and make any changes that it finds. Review the printed plan of actions. If everything looks as expected, type `yes` and press Enter to approve the action.

## Setting Up Firestore Database and Security Rules

### Enable Required APIs for Cloud Firestore
Append your `main.tf` file with the following resource blocks to enable the required APIs for Cloud Firestore:

```hcl
# Enable required APIs for Cloud Firestore.
resource "google_project_service" "firestore" {
  provider = google-beta

  project  = google_firebase_project.default.project
  for_each = toset([
    "firestore.googleapis.com",
    "firebaserules.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}
```

### Provision the Firestore Database Instance
Next, provision the Firestore database instance. Add the following resource block to your `main.tf` config file:

```hcl
# Provision the Firestore database instance.
resource "google_firestore_database" "default" {
  provider                    = google-beta

  project                     = google_firebase_project.default.project
  name                        = "(default)"
  location_id                 = "asia-south1"  # Change to desired region
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"

  depends_on = [
    google_project_service.firestore
  ]
}
```

Change `<NAME_OF_DESIRED_REGION>` to the region where you want the database to reside. For production apps, choose a region close to your users.

### Add Security Rules for Firestore
Every Firestore database instance accessible to Firebase must have Firebase Security Rules set up. Append your `main.tf` file with the following resource blocks to create and release a ruleset for Firestore:
rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}


![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20check.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20init.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/firebase%20cli%20login.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/install%20google%20cloud%20cli.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/google%20cloud%20cli%20login.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20init.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%201.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%202.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%203.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%204.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%205.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/terraform%20apply%206.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/Authentication.png)
![Example Image](https://github.com/Akhilesh-Chandewar/Fireform/blob/main/images/storage%20rules.png)
