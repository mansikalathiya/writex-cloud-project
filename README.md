# WriteX: LaTeX Resume Builder

WriteX is a powerful web application designed to simplify the job application process by providing tools for creating stunning LaTeX resumes and cover letters. The application leverages AWS services to ensure high availability, security, and cost-effectiveness.

## Features

- **Customize Your Resume:** Tailor your resume with our intuitive editor.
- **Real-Time Preview:** See live updates to your resume as you build it.
- **High-Quality PDFs:** Download professionally formatted PDFs ready to share with employers.

---

## Architecture Overview

The architecture of WriteX adheres to the AWS Well-Architected Framework, ensuring a secure, reliable, and efficient application.

### Components:

- **Frontend:** React-based application hosted on an EC2 instance.
- **Backend:** Node.js server hosted on an EC2 instance for API requests and database interactions.
- **Database:** Amazon RDS (PostgreSQL) to manage user data and document templates.
- **Object Storage:** Amazon S3 for storing generated PDFs.
- **Networking:** AWS VPC with public and private subnets for secure communication.
- **Load Balancer and Auto-Scaling Groups:** AWS Application Load Balancer and Auto Scaling for scalability and reliability.

---

## Key AWS Services Used

| Service          | Purpose                                                                                 |
|------------------|-----------------------------------------------------------------------------------------|
| **Amazon EC2**   | Hosts frontend and backend applications.                                                |
| **Amazon RDS**   | Manages relational database services with high availability and performance.            |
| **Amazon S3**    | Stores generated PDFs with high durability and low cost.                                |
| **AWS Lambda**   | Executes lightweight, event-driven microservices.                                       |
| **API Gateway**  | Exposes Lambda functions as scalable and secure APIs.                                   |
| **VPC**          | Enhances security with isolated public and private subnets.                             |
| **Auto Scaling** | Dynamically adjusts compute resources to handle varying workloads.                      |
| **Load Balancer**| Distributes traffic to ensure application reliability and performance.                  |

---

## AWS Well-Architected Principles

### Security
- Network segmentation with VPC public and private subnets.
- Data encryption in transit and at rest.
- Strict IAM policies for controlled access.

### Reliability
- Load balancing for fault tolerance.
- Auto-Scaling for workload fluctuations.
- Regular backups for disaster recovery.

### Performance Efficiency
- Optimized database queries.
- Serverless architecture using Lambda.
- Efficient storage on Amazon S3.

### Cost Optimization
- Rightsizing EC2 instances.
- Leveraging Spot and Reserved Instances.
- Regular cost monitoring.

### Sustainability
- Energy-efficient instance usage.
- Adherence to AWS renewable energy practices.

---

## Screenshots




