// ---------- Helpers: tokenization & skills extraction ----------

const STOPWORDS = new Set([
  "and","or","the","a","an","to","in","of","for","with","on","by","at","as","is","are","be",
  "that","this","it","from","we","you","our","your","their","they","i","he","she","them","us",
  "using","use","used","via","into","per","such","will","can","able","including","etc","&","/"
]);

// Common skills lexicon (extendable). Includes phrases and single words.
const SKILLS_LEXICON = new Set([
  // ===== CORE PROGRAMMING & SCRIPTING =====
  "javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "sql", "bash", "shell", "powershell", "perl", "haskell", "elixir", "erlang", "dart", "lua", "assembly", "webassembly", "wasm", "bun", "deno",

  // ===== WEB FRONTEND & FRAMEWORKS =====
  "react", "vue", "angular", "svelte", "next.js", "nuxt.js", "gatsby", "astro", "remix", "solidjs", "qwik", "html", "css", "sass", "scss", "less", "stylus", "tailwind css", "bootstrap", "material-ui", "chakra ui", "antd", "webpack", "vite", "rollup", "parcel", "babel", "esbuild", "swc", "turbopack", "jquery", "react server components", "app router",

  // ===== WEB BACKEND & FRAMEWORKS =====
  "node.js", "express", "nest.js", "fastify", "koa", "django", "flask", "fastapi", "spring", "spring boot", "spring mvc", "spring security", "spring data", "micronaut", "quarkus", "laravel", "symfony", "rails", "gin", "fiber", "actix", "rocket", "phoenix",

  // ===== MOBILE DEVELOPMENT =====
  "react native", "flutter", "android", "ios", "swiftui", "uikit", "jetpack compose", "xamarin", "ionic", "capacitor", "expo", "maestro", "detox", "react native new architecture", "android sdk", "android studio", "material design", "fragments", "activities", "services", "broadcast receivers", "content providers", "room database", "sqlite", "realm", "retrofit", "volley", "glide", "picasso", "firebase", "google play services", "in-app purchases", "subscriptions", "push notifications", "deep linking", "app bundles", "proguard", "r8",

  // ===== DATABASES & DATA STORES =====
  "mysql", "postgresql", "sqlite", "microsoft sql server", "oracle", "mongodb", "cassandra", "redis", "elasticsearch", "opensearch", "dynamodb", "cosmos db", "firestore", "bigtable", "hbase", "couchbase", "neo4j", "arangodb", "influxdb", "prometheus", "snowflake", "databricks", "bigquery", "redshift", "snowpipe", "dbt", "vector database", "pinecone", "weaviate", "chroma", "qdrant", "milvus", "database design", "performance tuning", "query optimization", "indexing", "backup recovery", "disaster recovery", "high availability", "replication", "clustering", "partitioning", "security management", "user permissions", "capacity planning", "monitoring", "alerting", "patch management", "migration", "upgrade", "data modeling", "normalization", "data integrity",

  // ===== API & COMMUNICATION PROTOCOLS =====
  "rest", "graphql", "grpc", "soap", "web sockets", "webhook", "apache kafka", "rabbitmq", "aws sqs", "azure service bus", "google pub/sub", "nginx", "apache", "opc ua", "modbus", "can bus", "mqtt", "websockets", "api design", "microservices", "restful webservices", "soap webservices",

  // ===== CLOUD PLATFORMS & SERVICES =====
  // AWS
  "aws", "amazon web services", "ec2", "lambda", "s3", "rds", "dynamodb", "ecs", "eks", "fargate", "iam", "cloudformation", "cloudfront", "route53", "vpc", "sns", "sqs", "eventbridge", "step functions", "codebuild", "codepipeline", "codedeploy", "cloudwatch", "x-ray", "aws glue", "aws lake formation", "bedrock", "sagemaker", "sagemaker endpoints",
  // Microsoft Azure
  "azure", "azure functions", "azure vm", "blob storage", "cosmos db", "azure sql", "aks", "azure kubernetes services", "app service", "azure devops", "azure pipelines", "arm templates", "azure resource manager", "azure monitor", "application insights", "azure data factory", "azure databricks", "azure synapse", "azure openai", "azure active directory", "azure ad", "azure load balancer", "azure policy", "azure sql database", "azure backup server", "azure sentinel", "defender for cloud", "expressroute", "site-to-site vpn", "azure advisor", "service health", "log analytics",
  // Google Cloud (GCP)
  "gcp", "google cloud", "compute engine", "cloud functions", "cloud run", "gke", "bigquery", "cloud storage", "firestore", "pub/sub", "cloud build", "cloud deploy", "stackdriver", "google dataflow", "google dataproc", "vertex ai",
  // Cloud-Agnostic & Other
  "kubernetes", "docker", "helm", "serverless", "serverless architecture", "terraform", "pulumi", "crossplane", "ansible", "chef", "puppet", "vagrant", "packer", "cloudflare workers", "vercel", "netlify", "openstack", "openfaas", "knative", "cloud migration", "cloud optimization", "cost optimization", "resource governance", "disaster recovery", "business continuity", "high availability", "fault tolerance", "load balancing", "auto-scaling", "monitoring", "alerting", "cloud security", "identity management", "network security groups", "application gateways", "cost management",

  // ===== DEVOPS & SRE & PLATFORM ENGINEERING =====
  "ci/cd", "continuous integration", "continuous deployment", "jenkins", "gitlab ci", "github actions", "circleci", "travis ci", "azure pipelines", "argo cd", "flux", "jenkins x", "spinnaker", "tekton", "istio", "linkerd", "consul", "envoy", "vault", "prometheus", "grafana", "loki", "jaeger", "zipkin", "sre", "site reliability engineering", "error budget", "sli", "slo", "chaos engineering", "platform engineering", "internal developer platform", "backstage", "porter", "scorecard", "gitops", "infrastructure as code", "configuration management", "continuous testing", "continuous monitoring", "release management", "deployment strategies", "blue-green deployment", "canary deployment", "rollback strategies", "environment management", "secret management", "vault integration", "container security", "image scanning", "runtime security", "compliance as code", "chatops", "devsecops", "shift-left", "performance testing", "load testing", "apm tools", "log aggregation", "distributed tracing", "service level objectives",

  // ===== DATA ENGINEERING & BIG DATA =====
  "apache spark", "apache flink", "apache beam", "apache hive", "apache impala", "apache airflow", "prefect", "dagster", "luigi", "kubeflow", "apache nifi", "streamsets", "data lake", "data warehouse", "data mesh", "elt", "etl", "extract transform load", "data pipeline", "data modeling", "dimensional modeling", "data vault", "data governance", "data quality", "great expectations", "monte carlo", "collibra", "alation", "airbyte", "fivetran", "stripe", "reverse etl", "data lineage", "data catalog", "data privacy", "data versioning", "dvc", "data cleaning", "data wrangling", "data validation", "exploratory data analysis", "eda", "data profiling", "master data management", "kpi tracking", "metric development", "business reporting", "ad-hoc analysis", "sql querying", "data extraction", "data blending", "looker studio", "power bi", "tableau", "microstrategy", "qlik sense", "data governance", "olap", "ssrs", "ssis",

  // ===== AI/ML/MLOPS & DATA SCIENCE =====
  "machine learning", "ml", "deep learning", "natural language processing", "nlp", "computer vision", "generational ai", "generative ai", "llm", "large language models", "gpt", "bert", "transformers", "diffusion models", "stable diffusion", "dall-e", "midjourney", "clip", "whisper", "langchain", "llamaindex", "llama.cpp", "ollama", "vllm", "triton", "rag", "retrieval-augmented generation", "fine-tuning", "lora", "qlora", "prompt engineering", "model quantization", "ai agents", "autonomous agents", "crewai", "ai engineering", "supervised learning", "unsupervised learning", "reinforcement learning", "neural networks", "cnn", "rnn", "lstm", "gan", "gans", "hugging face", "pytorch", "tensorflow", "keras", "jax", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "plotly", "mlflow", "weights & biases", "kubeflow", "sagemaker", "azure ml", "vertex ai", "dataiku", "domino data lab", "feature store", "feast", "hopsworks", "model deployment", "model serving", "model registry", "model monitoring", "evidently ai", "a/b testing", "statistics", "probability", "hypothesis testing", "time series", "experimentation", "tensorrt", "openvino", "onnx runtime", "core ml", "tensorflow lite", "edge ai", "ray", "mlagents", "unity ml", "responsible ai", "model fairness", "explainable ai", "ai ethics", "mlops", "feature engineering", "hyperparameter tuning", "transfer learning", "neural architecture search", "automl", "object detection", "image segmentation", "speech recognition", "time series forecasting", "anomaly detection", "recommendation systems", "attention mechanisms", "llama", "vector databases", "model pruning", "distributed training", "federated learning", "data drift", "concept drift", "sagemaker endpoints", "torchserve", "tensorflow serving", "onnx", "nvidia triton", "statistical modeling", "experimental design", "causal inference", "bayesian statistics", "time series analysis", "survival analysis", "cluster analysis", "factor analysis", "predictive modeling", "prescriptive analytics", "monte carlo simulation", "markov chains", "ensemble methods", "cross-validation", "feature importance", "shap values", "business intelligence", "storytelling", "dashboard creation", "multivariate testing",

  // ===== EMBEDDED SYSTEMS & IOT & ROBOTICS =====
  "embedded c", "embedded c++", "rtos", "real-time operating systems", "freeRTOS", "zephyr", "vxworks", "arm architecture", "avr", "arduino", "raspberry pi", "microcontrollers", "fpga", "verilog", "vhdl", "systemc", "embedded linux", "yocto", "buildroot", "device drivers", "can bus", "i2c", "spi", "uart", "usb", "bluetooth", "zigbee", "lorawan", "mqtt", "iot", "industrial iot", "cyber-physical systems", "autosar", "can fd", "ethercat", "ros", "ros2", "robotics", "industrial robotics", "fanuc", "kuka", "abb", "plc", "programmable logic controller", "scada", "hmi", "sensors", "actuators", "control systems", "pid control", "industrial automation", "industry 4.0", "digital manufacturing", "mechatronics", "labview", "matlab", "simulink", "digital twin", "opc ua", "modbus", "bare-metal programming", "bootloader", "firmware", "hardware abstraction layer", "hal", "board support package", "bsp", "interrupt service routines", "isr", "memory-mapped i/o", "dma", "watchdog timer", "power management", "low-power design", "safety-critical systems", "misra c", "automotive standards", "industrial standards", "iec 61131-3", "automation", "ladder logic", "motor control", "motion control", "industrial networks", "profibus", "profinet", "machine vision", "system integration", "troubleshooting", "preventive maintenance",

  // ===== CYBERSECURITY & DEVSECOPS =====
  "cybersecurity", "appsec", "devsecops", "owasp", "secure sdlc", "threat modeling", "stride", "sast", "dast", "iapast", "sca", "dependency scanning", "software composition analysis", "sonarqube", "checkmarx", "veracode", "snyk", "burp suite", "metasploit", "nessus", "qualys", "penetration testing", "vulnerability management", "siem", "splunk", "elastic siem", "arcsight", "qradar", "soar", "phoenix", "demisto", "incident response", "digital forensics", "cryptography", "pki", "zero trust", "sase", "casb", "cspm", "cloud security posture management", "cwpp", "cloud workload protection", "ids", "ips", "waf", "firewall", "cis controls", "nist", "iso 27001", "soc 2", "gdpr", "ccpa", "edr", "ndr", "xdr", "purple team", "threat intelligence", "oauth 2.0", "openid connect", "saml", "beyondcorp", "smart contract auditing", "web3 security", "blockchain security", "post-quantum cryptography", "quantum-safe", "sigstore", "cosign", "threat intelligence", "vulnerability assessment", "digital forensics", "malware analysis", "siem administration", "log analysis", "security monitoring", "threat hunting", "indicators of compromise", "ioc", "attack vectors", "kill chain", "mitre att&ck", "security orchestration", "endpoint detection", "network detection", "firewall management", "security controls", "compliance auditing", "risk assessment", "security awareness", "firewall configuration", "vpn setup", "intrusion prevention", "network segmentation", "zero trust architecture", "secure web gateway", "cloud access security broker", "network access control", "nac", "wireless security", "ddos protection", "dns security", "network monitoring", "packet analysis", "wireshark", "network hardening", "ssl/tls inspection", "web application firewall", "api security", "microsegmentation", "software-defined networking",

  // ===== BLOCKCHAIN & WEB3 =====
  "blockchain", "web3", "solidity", "ethereum", "smart contracts", "defi", "nft", "cryptocurrency", "bitcoin", "consensus algorithms", "ipfs", "metamask", "web3.js", "ethers.js", "hardhat", "truffle",

  // ===== TESTING & QUALITY ASSURANCE =====
  "unit testing", "integration testing", "end-to-end testing", "e2e testing", "regression testing", "performance testing", "load testing", "stress testing", "security testing", "accessibility testing", "a11y", "jest", "vitest", "mocha", "chai", "jasmine", "cypress", "playwright", "selenium", "puppeteer", "appium", "k6", "jmeter", "gatling", "postman", "soapui", "testcafe", "cucumber", "selenium grid", "browserstack", "saucelabs", "testrail", "qtest", "shift-left testing", "test pyramid", "contract testing", "pact", "chaos engineering", "junit", "mockito",

  // ===== UI/UX & DESIGN =====
  "ux design", "ui design", "user research", "usability testing", "user interviews", "surveys", "persona development", "journey mapping", "information architecture", "wireframing", "prototyping", "interaction design", "visual design", "design systems", "component libraries", "accessibility", "wcag", "responsive design", "mobile-first design", "design thinking", "design sprints", "stakeholder presentation", "design handoff", "figma", "sketch", "adobe xd", "invision", "framer", "axure", "balsamiq", "zeplin", "abstract", "principle", "protopie", "storybook", "design thinking", "user journey mapping", "service design",

  // ===== ADVANCED COMMUNICATION SKILLS =====
  "verbal communication", "written communication", "active listening", "public speaking", "presentation skills", "storytelling", "executive communication", "cross-cultural communication", "non-verbal communication", "influential communication", "negotiation skills", "persuasion techniques", "facilitation skills", "meeting management", "board presentation", "investor communication", "client facing", "stakeholder communication", "crisis communication", "conflict resolution", "difficult conversations", "feedback delivery", "coaching conversations", "mentoring discussions", "technical writing", "business writing", "email communication", "virtual communication", "remote collaboration", "interpersonal skills", "relationship building", "networking", "influence", "diplomacy", "articulation", "clarity", "conciseness", "empathy", "emotional intelligence",

  // ===== LEADERSHIP & MANAGEMENT =====
  "team leadership", "people management", "performance management", "talent development", "succession planning", "organizational development", "change leadership", "transformation leadership", "strategic leadership", "operational leadership", "servant leadership", "situational leadership", "delegation", "empowerment", "decision making", "strategic planning", "vision setting", "mission alignment", "values leadership", "ethical leadership", "inclusive leadership", "diversity equity inclusion", "belonging", "team building", "culture building", "employee engagement", "motivation techniques", "recruitment", "hiring", "onboarding", "offboarding", "retention strategies", "compensation planning", "benefits administration", "managerial courage", "executive presence", "thought leadership", "industry leadership", "community leadership",

  // ===== BUSINESS & STRATEGY =====
  "business strategy", "corporate strategy", "competitive analysis", "market analysis", "industry analysis", "business development", "partnership development", "alliance management", "channel management", "sales strategy", "marketing strategy", "go-to-market strategy", "product strategy", "technology strategy", "digital transformation", "innovation management", "portfolio management", "program management", "project management", "risk management", "financial management", "budget management", "p&l management", "cost management", "revenue management", "profitability analysis", "roi analysis", "business case development", "investment analysis", "mergers acquisitions", "m&a", "due diligence", "corporate development", "strategic partnerships", "market positioning", "competitive positioning", "value proposition", "business model innovation", "corporate governance", "board management", "investor relations", "shareholder management", "requirements gathering", "requirements analysis", "user acceptance testing", "uat", "swot analysis", "root cause analysis", "gap analysis", "business process mapping", "use case modelling", "business requirements document", "brd", "functional specifications", "stakeholder analysis", "business process modeling", "use case development", "user stories", "acceptance criteria", "backlog management", "prioritization techniques", "cost-benefit analysis", "impact analysis", "change management", "training",

  // ===== ANALYTICAL & PROBLEM-SOLVING =====
  "critical thinking", "analytical reasoning", "problem solving", "root cause analysis", "systems thinking", "design thinking", "lean thinking", "strategic thinking", "conceptual thinking", "creative thinking", "innovation thinking", "data analysis", "business analysis", "process analysis", "workflow analysis", "requirements analysis", "gap analysis", "impact analysis", "scenario planning", "forecasting", "predictive analytics", "diagnostic analytics", "prescriptive analytics", "decision analysis", "risk analysis", "cost-benefit analysis", "return on investment", "kpi development", "metric design", "dashboard design", "reporting", "data visualization", "business intelligence", "market research", "customer research", "user research", "competitive intelligence", "qualitative analysis", "quantitative analysis", "statistical analysis", "trend analysis", "pattern recognition", "hypothesis testing", "experimentation", "a/b testing", "multivariate testing",

  // ===== PROJECT & PROGRAM MANAGEMENT =====
  "project management", "program management", "portfolio management", "project planning", "project execution", "project monitoring", "project control", "project closure", "scope management", "time management", "cost management", "quality management", "resource management", "communication management", "risk management", "stakeholder management", "procurement management", "integration management", "agile project management", "waterfall project management", "hybrid project management", "prince2", "pmp", "pmbok", "project charter", "project plan", "work breakdown structure", "wbs", "critical path method", "cpm", "pert", "gannt chart", "milestone tracking", "status reporting", "project governance", "program governance", "portfolio governance", "resource allocation", "capacity planning", "timeline management", "budget control", "quality assurance", "quality control", "delivery management", "release management",

  // ===== SALES & MARKETING =====
  "sales", "business development", "account management", "key account management", "territory management", "sales operations", "sales enablement", "sales forecasting", "pipeline management", "lead generation", "prospecting", "qualification", "needs analysis", "solution selling", "value selling", "consultative selling", "relationship selling", "negotiation", "closing", "account planning", "customer relationship management", "crm", "salesforce", "hubspot", "marketing", "digital marketing", "content marketing", "social media marketing", "email marketing", "search engine marketing", "sem", "search engine optimization", "seo", "pay-per-click", "ppc", "display advertising", "video marketing", "mobile marketing", "influencer marketing", "affiliate marketing", "brand management", "product marketing", "market research", "customer insights", "buyer personas", "customer journey mapping", "conversion rate optimization", "cro", "marketing automation", "campaign management", "event management", "public relations", "pr", "media relations", "crisis communications", "account based marketing", "abm", "inbound marketing", "growth hacking", "demand generation", "lead nurturing", "sales cycle management", "revenue operations", "revops", "google ads", "google analytics", "ga4", "tag manager", "landing page optimization", "kpi tracking", "customer acquisition", "sales funnel",

  // ===== OPERATIONS & SUPPLY CHAIN =====
  "operations management", "supply chain management", "logistics management", "procurement", "sourcing", "vendor management", "supplier management", "inventory management", "warehouse management", "distribution management", "transportation management", "demand planning", "supply planning", "production planning", "capacity planning", "scheduling", "quality management", "process improvement", "lean manufacturing", "six sigma", "continuous improvement", "kaizen", "5s", "total quality management", "tqm", "statistical process control", "spc", "root cause analysis", "corrective action", "preventive action", "operational excellence", "facilities management", "maintenance management", "reliability engineering", "safety management", "environmental management", "regulatory compliance", "import export", "customs compliance", "trade compliance", "reverse logistics", "returns management", "supply chain optimization", "logistics optimization", "inventory optimization", "warehouse optimization", "transportation optimization", "supply chain analytics", "logistics analytics", "operational analytics", "demand forecasting", "inventory optimization", "supplier management", "vendor management", "logistics coordination", "transportation management", "warehouse management", "order fulfillment", "procurement", "sourcing", "supply chain visibility", "risk mitigation", "cost reduction", "process improvement", "erp systems", "sap", "oracle", "wms", "tms",

  // ===== HUMAN RESOURCES & TALENT =====
  "human resources", "hr business partner", "talent acquisition", "recruitment", "sourcing", "screening", "interviewing", "selection", "onboarding", "offboarding", "performance management", "compensation", "benefits", "total rewards", "employee relations", "labor relations", "employment law", "compliance", "training development", "learning development", "organizational development", "succession planning", "career development", "leadership development", "competency modeling", "job analysis", "workforce planning", "hr analytics", "employee engagement", "culture development", "diversity inclusion", "change management", "hr technology", "hr information systems", "hris", "payroll", "time attendance", "policy development", "procedure development", "talent management", "performance appraisal", "employee retention", "hr strategy", "workforce analytics", "employee experience", "hr transformation", "digital hr", "hr operations", "hr service delivery",

  // ===== CUSTOMER SUCCESS & SUPPORT =====
  "customer success", "customer support", "technical support", "help desk", "service desk", "customer service", "client services", "account management", "relationship management", "customer experience", "cx", "user experience", "ux", "customer journey", "voice of customer", "voc", "customer feedback", "satisfaction surveys", "net promoter score", "nps", "customer satisfaction", "csat", "customer effort score", "ces", "retention strategies", "churn reduction", "loyalty programs", "advocacy programs", "community management", "knowledge management", "ticketing systems", "zendesk", "freshdesk", "salesforce service cloud", "service level agreement", "sla", "operational level agreement", "ola", "key performance indicator", "kpi", "customer onboarding", "customer training", "success planning", "quarterly business reviews", "qbr", "escalation management", "issue resolution", "customer advocacy", "reference management",

  // ===== FINANCE & ACCOUNTING =====
  "financial analysis", "financial planning", "financial modeling", "budgeting", "forecasting", "reporting", "accounting", "bookkeeping", "accounts payable", "accounts receivable", "general ledger", "reconciliation", "audit", "internal controls", "tax compliance", "treasury management", "cash management", "working capital management", "capital budgeting", "investment analysis", "mergers acquisitions", "m&a", "due diligence", "valuation", "financial reporting", "management reporting", "dashboard reporting", "kpi reporting", "profit loss management", "p&l management", "cost accounting", "managerial accounting", "financial accounting", "gaap", "ifrs", "sox compliance", "internal audit", "external audit", "risk management", "credit analysis", "collections", "financial controls", "accounting systems", "financial systems", "erp financials", "financial transformation", "financial operations", "fp&a", "financial planning analysis",

  // ===== LEGAL & COMPLIANCE =====
  "contract management", "contract negotiation", "legal research", "regulatory compliance", "policy development", "risk assessment", "due diligence", "corporate governance", "intellectual property", "ip management", "patent filing", "trademark registration", "copyright protection", "privacy law", "data protection", "gdpr", "ccpa", "hipaa", "pci dss", "export control", "trade compliance", "antitrust law", "employment law", "labor law", "litigation management", "dispute resolution", "mediation", "arbitration", "compliance monitoring", "audit management", "ethics compliance", "whistleblower programs", "investigation management", "legal documentation", "contract drafting", "legal advisory", "corporate law", "securities law", "regulatory affairs", "compliance training", "policy enforcement", "regulatory reporting", "legal operations",

  // ===== EDUCATION & TRAINING =====
  "instructional design", "curriculum development", "training delivery", "facilitation", "coaching", "mentoring", "tutoring", "educational technology", "edtech", "learning management systems", "lms", "course development", "content development", "assessment design", "evaluation", "competency development", "skill development", "professional development", "leadership development", "organizational learning", "knowledge management", "adult learning principles", "andragogy", "pedagogy", "blended learning", "online learning", "synchronous learning", "asynchronous learning", "microlearning", "gamification", "simulation", "virtual training", "classroom training", "workshop facilitation", "webinar delivery", "training needs analysis", "learning evaluation", "training impact assessment", "certification programs", "accreditation", "educational leadership", "academic administration",

  // ===== PRODUCT, PROJECT & BUSINESS MANAGEMENT =====
  "agile", "scrum", "kanban", "lean", "waterfall", "safe", "less", "nexus", "scrum@scale", "jira", "confluence", "trello", "asana", "azure boards", "clickup", "monday.com", "smartsheet", "product management", "product strategy", "product roadmap", "prioritization", "backlog grooming", "user stories", "acceptance criteria", "story points", "estimation", "sprint planning", "retrospective", "daily stand-up", "okr", "kpi", "roi", "business case", "stakeholder management", "requirements gathering", "brd", "functional specifications", "uat", "change management", "risk management", "budget management", "domain-driven design", "clean architecture", "hexagonal architecture", "event sourcing", "cqrs", "architecture decision records", "adr", "rfc process", "architecture review", "technical leadership", "rice", "moscow", "kpi definition", "success metrics", "market research", "competitive analysis", "customer discovery", "user interviews", "persona development", "journey mapping", "go-to-market strategy", "product launch", "lifecycle management", "pricing strategy", "cross-functional leadership", "agile product ownership",

  // ===== BUSINESS INTELLIGENCE & ANALYSIS =====
  "business intelligence", "bi", "data analysis", "data visualization", "dashboard", "reporting", "power bi", "tableau", "looker", "lookml", "qlik", "qlikview", "qliksense", "microstrategy", "domo", "sisense", "spotfire", "excel", "vba", "google sheets", "sql", "data mining", "predictive modeling", "descriptive analytics", "diagnostic analytics", "prescriptive analytics", "etl", "data warehousing", "star schema", "snowflake schema", "kpi", "metric", "six sigma", "lean manufacturing", "root cause analysis", "swot analysis", "pestle analysis", "gap analysis", "cost-benefit analysis", "process mapping", "use case modeling", "business model canvas", "lean canvas", "value proposition design", "jobs-to-be-done", "user story mapping", "impact mapping",

  // ===== SUPPLY CHAIN & MANUFACTURING =====
  "supply chain management", "scm", "logistics", "procurement", "inventory management", "demand planning", "forecasting", "supplier relationship management", "srm", "warehouse management system", "wms", "transportation management system", "tms", "enterprise resource planning", "erp", "sap", "oracle scm", "netsuite", "kinaxis", "blue yonder", "six sigma", "dmaic", "lean", "5s", "kaizen", "value stream mapping", "just-in-time", "jit", "mrp", "mrp ii", "cpfr", "supply chain analytics", "digital twin", "iot in scm", "blockchain in scm", "rfid", "iot sensors", "predictive analytics", "mes", "manufacturing execution system",

  // ===== MANUFACTURING & MECHATRONICS =====
  "cad", "solidworks", "autocad", "catia", "nx siemens", "ansys", "finite element analysis", "fea", "computational fluid dynamics", "cfd", "gd&t", "tolerance analysis", "design for manufacturing", "dfm", "design for assembly", "dfa", "prototyping", "3d printing", "cnc machining", "injection molding", "quality control", "statistical process control", "spc", "root cause analysis", "failure mode effects analysis", "fmea", "lean manufacturing", "six sigma", "robotics", "automation", "plc programming", "ladder logic", "scada", "hmi design", "sensors", "actuators", "motor control", "motion control", "control systems", "pid control", "industrial networks", "profibus", "profinet", "machine vision", "industrial iot", "industry 4.0", "digital twin", "system integration", "troubleshooting", "preventive maintenance",

  // ===== CLINICAL & HEALTHCARE =====
  "clinical data management", "healthcare informatics", "hl7", "fhir", "hipaa", "electronic health records", "ehr", "emr", "epic", "cerner", "clinical trials", "cdisc", "sdtm", "adam", "meddra", "who drug", "biostatistics", "clinical research", "regulatory compliance", "fda", "gcp", "good clinical practice", "pharmaceutical", "medical devices", "real world evidence", "rwe", "clinical trials", "cdisc standards", "sdtm", "adam", "meddra", "who drug dictionary", "electronic data capture", "edc", "clinical data management", "cdm", "case report forms", "protocol compliance", "adverse event reporting", "patient safety data", "regulatory submissions", "fda guidelines", "ema regulations", "good clinical practice", "gcp", "hipaa compliance", "pharmacovigilance", "biostatistics", "sas programming", "clinical databases", "medidata rave",

  // ===== ENTERPRISE SYSTEMS & ROLES =====
  // Workday
  "workday", "workday hcm", "workday financials", "workday studio", "workday report writer", "workday calculated fields", "workday security", "workday integrations", "core connectors", "eib", "workday extend", "hcm implementation", "system configuration", "business process configuration", "security configuration", "role-based security", "data migration", "data conversion", "integration development", "report development", "bi publisher", "otbi", "fast formulas", "hcm extracts", "payroll processing", "benefits administration", "talent management", "recruitment", "performance management", "compensation planning", "user training", "support", "troubleshooting", "upgrade management",
  // Oracle Cloud HCM
  "oracle cloud hcm", "oracle hcm cloud", "fast formula", "hcm extracts", "otbi", "bi publisher", "oracle fusion", "fldi", "oracle scm cloud", "hcm implementation", "system configuration", "business process configuration", "security configuration", "role-based security", "data migration", "data conversion", "integration development", "report development", "bi publisher", "otbi", "fast formulas", "hcm extracts", "payroll processing", "benefits administration", "talent management", "recruitment", "performance management", "compensation planning", "user training", "support", "troubleshooting", "upgrade management",
  // SharePoint & .NET
  "sharepoint", "sharepoint online", "sharepoint framework", "spfx", "power apps", "power automate", "microsoft flow", ".net", ".net core", "asp.net", "asp.net core", "entity framework", "blazor", "xamarin", "wpf", "winforms",
  // Mainframe
  "mainframe", "cobol", "jcl", "cics", "db2", "ims", "vsam", "assembler", "pl/i", "natural", "adabas", "zos", "tso", "ispf", "rexx", "cobol 85", "cobol 2002", "mainframe debugging", "file handling", "batch processing", "online systems", "mainframe security", "racf", "storage management", "dfsms", "performance monitoring", "capacity planning", "mainframe modernization", "legacy system maintenance", "mainframe integration",

  // ===== DIGITAL MARKETING =====
  "seo", "search engine optimization", "sem", "search engine marketing", "ppc", "google ads", "google analytics", "ga4", "social media marketing", "smm", "content marketing", "email marketing", "marketing automation", "hubspot", "marketo", "pardot", "mailchimp", "google tag manager", "gtm", "conversion rate optimization", "cro", "a/b testing", "multivariate testing", "kpi", "roi", "cpc", "cpa", "ctr", "crm", "salesforce", "zoho", "linkedin marketing", "facebook ads", "programmatic advertising", "account based marketing", "abm", "inbound marketing", "growth hacking",

  // ===== NETWORK & INFRASTRUCTURE =====
  "network engineering", "network design", "lan/wan", "routing", "switching", "vlan", "vpn", "bgp", "ospf", "eigrp", "ip addressing", "subnetting", "dns", "dhcp", "network monitoring", "snmp", "netflow", "qos", "voip", "sip", "wireless networking", "wi-fi", "network automation", "python scripting", "ansible", "network documentation", "capacity planning", "performance tuning",

  // ===== DIGITAL VERIFICATION ENGINEER =====
  "digital verification", "systemverilog", "uvm", "verification planning", "testbench development", "coverage driven verification", "functional coverage", "code coverage", "assertion based verification", "formal verification", "emulation", "fpga prototyping", "debugging", "regression testing", "verification ip", "methodology development", "verification closure",

  // ===== OPERATION COORDINATOR =====
  "operation coordination", "process coordination", "workflow management", "resource allocation", "scheduling", "capacity planning", "performance monitoring", "reporting", "documentation", "procedure development", "training", "quality assurance", "compliance monitoring", "vendor coordination", "stakeholder communication", "issue resolution", "escalation management", "continuous improvement",

  // ===== EMERGING TECHNOLOGIES =====
  "spatial computing", "arkit", "arcore", "virtual reality", "vr", "augmented reality", "ar", "mixed reality", "mr", "metaverse", "webxr", "quantum computing", "iot", "edge computing", "green software", "sustainable tech", "carbon awareness", "fintech", "insurtech", "healthtech", "edtech", "cleantech", "generative ai", "large language models", "multimodal ai", "ai governance", "responsible ai", "ml observability", "feature stores", "model registry", "service mesh", "gitops", "platform engineering", "finops", "cloud cost optimization", "serverless architecture", "edge computing", "multi-cloud strategy", "web3", "blockchain", "metaverse", "ar/vr development", "low-code platforms", "api-first development", "microfrontends", "jamstack", "headless architecture", "zero trust", "cloud security posture management", "supply chain security", "devsecops", "security automation", "threat modeling", "privacy engineering",

  // ===== FINANCE & COMPLIANCE =====
  "fintech", "payment systems", "pci dss", "regulatory compliance", "sox", "anti-money laundering", "aml", "know your customer", "kyc", "financial modeling", "risk management", "actuary", "quantitative analysis", "algorithmic trading",

  // ===== PERSONAL EFFECTIVENESS & SOFT SKILLS =====
  "communication", "leadership", "mentoring", "coaching", "teamwork", "collaboration", "problem solving", "critical thinking", "analytical skills", "debugging", "troubleshooting", "performance optimization", "presentation skills", "public speaking", "technical writing", "documentation", "time management", "project management", "conflict resolution", "negotiation", "adaptability", "creativity", "innovation", "customer focus", "business acumen", "strategic thinking", "ownership", "accountability", "resilience", "emotional intelligence", "scrum master", "product owner", "agile coach", "smart goals", "raci matrix", "pmo", "stakeholder management", "influence", "decision making", "critical thinking", "systems thinking", "design thinking", "product thinking", "initiative", "proactivity", "self motivation", "continuous learning", "growth mindset", "adaptability", "flexibility", "change management", "stress management", "work life balance", "professionalism", "work ethic", "integrity", "trustworthiness", "reliability", "dependability", "attention to detail", "accuracy", "precision", "quality focus", "results orientation", "outcome focus", "value delivery", "customer centricity", "user focus", "empathy", "cultural awareness", "global mindset", "multicultural competence", "agile methodology", "scrum", "kanban", "lean", "waterfall", "devops", "site reliability engineering", "sre", "itil", "cobit", "tosca"
]);

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9.+#\/\-\s]/g, " ") // keep tech symbols like c++, c#, node.js, next.js
    .replace(/\s+/g, " ")
    .trim();
}

function ngrams(tokens, maxN = 3) {
  const grams = new Set();
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n).join(" ");
      grams.add(gram);
    }
  }
  return grams;
}

function tokenize(text) {
  const norm = normalize(text);
  const tokens = norm.split(" ").filter(t => t && !STOPWORDS.has(t));
  return tokens;
}

function extractSkillsFreeform(text) {
  const tokens = tokenize(text);
  const grams = ngrams(tokens, 3);
  const hits = new Set();

  // fuzzy helpers for common variants
  const normalizeSkill = (s) => s
    .replace(/\bnodejs\b/g, "node")
    .replace(/\bnode\.js\b/g, "node")
    .replace(/\bc\s*\+\+\b/g, "c++")
    .replace(/\bc\s*#\b/g, "c#")
    .replace(/\bci\s*\/\s*cd\b/g, "ci/cd")
    .replace(/\breactjs\b/g, "react")
    .replace(/\bjavascript\b/g, "javascript");

  // check phrases first (3->2->1 grams)
  for (const g of Array.from(grams).sort((a,b)=>b.split(" ").length-a.split(" ").length)) {
    const gNorm = normalizeSkill(g);
    if (SKILLS_LEXICON.has(gNorm)) hits.add(gNorm);
  }

  // heuristic: keep capitalized acronyms and techy tokens with +/-/#/.
  for (const t of tokens) {
    if (t.length <= 2) continue;
    if (/^[a-z0-9.+#\/-]+$/.test(t)) {
      if (SKILLS_LEXICON.has(t)) hits.add(t);
      // capture likely skills even if not in lexicon (acronyms etc.)
      if (/^(aws|gcp|ci\/cd|ui|ux)$/i.test(t)) hits.add(t);
    }
  }
  return Array.from(hits).sort();
}

function jaccardPrecisionRecall(jdSkills, resumeSkills) {
  const jd = new Set(jdSkills);
  const res = new Set(resumeSkills);
  const inter = new Set([...jd].filter(x => res.has(x)));
  const precision = res.size ? inter.size / res.size : 0;
  const recall = jd.size ? inter.size / jd.size : 0;
  const f1 = (precision + recall) ? (2 * precision * recall) / (precision + recall) : 0;
  // Our headline score: percentage of JD skills covered (recall)
  const coverage = Math.round(recall * 100);
  return { coverage, precision, recall, f1, matched: Array.from(inter).sort() };
}

// ---------- PDF -> text via PDF.js ----------

async function pdfToText(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js not loaded");
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map(i => (typeof i.str === "string" ? i.str : ""));
    fullText += "\n" + strings.join(" ");
  }
  return fullText;
}

// ---------- UI wiring ----------

const jdEl = document.getElementById("jd");
const resumeEl = document.getElementById("resume");
const fileInfoEl = document.getElementById("fileInfo");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const resultsEl = document.getElementById("results");
const jdSkillsEl = document.getElementById("jdSkills");
const resumeSkillsEl = document.getElementById("resumeSkills");
const matchedSkillsEl = document.getElementById("matchedSkills");
const progressEl = document.getElementById("progress");
const scoreLabelEl = document.getElementById("scoreLabel");
const debugEl = document.getElementById("debug");

function pills(container, arr) {
  container.innerHTML = arr.map(s => `<span class="kpill">${s}</span>`).join(" ");
}

function saveState(state) {
  chrome.storage.local.set(state);
}

function restoreState() {
  chrome.storage.local.get(["jdText", "resumeName", "resumeText"], (data) => {
    if (data.jdText) jdEl.value = data.jdText;
    if (data.resumeName) fileInfoEl.textContent = data.resumeName;
    if (data.resumeText) {
      // nothing to show here; resume text is used internally for analysis
    }
  });
}

restoreState();

resumeEl.addEventListener("change", () => {
  const file = resumeEl.files && resumeEl.files[0];
  if (!file) { fileInfoEl.textContent = "No file selected"; return; }
  fileInfoEl.textContent = file.name;
  saveState({ resumeName: file.name });
});

clearBtn.addEventListener("click", () => {
  jdEl.value = "";
  resumeEl.value = "";
  fileInfoEl.textContent = "No file selected";
  resultsEl.style.display = "none";
  chrome.storage.local.clear();
});

analyzeBtn.addEventListener("click", async () => {
  const jdText = jdEl.value.trim();
  if (!jdText) {
    alert("Please paste the job description.");
    return;
  }
  let resumeText = "";
  const file = resumeEl.files && resumeEl.files[0];
  try {
    if (file) {
      resumeText = await pdfToText(file);
    } else {
      const fallback = confirm("No PDF selected. Continue by analyzing only the job description?");
      if (!fallback) return;
    }
  } catch (e) {
    console.error(e);
    debugEl.textContent = (debugEl.textContent || "") + "\nPDF error: " + (e && e.message ? e.message : String(e));
    alert("Failed to read the PDF. Ensure the file is a valid PDF and that PDF.js files are installed in libs/pdfjs/. See Debug details below.");
  }

  // Persist locally
  saveState({ jdText, resumeText });

  // Extract skills
  const jdSkills = extractSkillsFreeform(jdText);
  const resumeSkills = extractSkillsFreeform(resumeText);
  const { coverage, precision, recall, f1, matched } = jaccardPrecisionRecall(jdSkills, resumeSkills);

  // Update UI
  pills(jdSkillsEl, jdSkills);
  pills(resumeSkillsEl, resumeSkills);
  pills(matchedSkillsEl, matched);
  progressEl.style.width = coverage + "%";
  scoreLabelEl.innerHTML = `Match Score: <strong>${coverage}%</strong>`;
  resultsEl.style.display = "grid";

  debugEl.textContent = JSON.stringify({
    counts: { jdSkills: jdSkills.length, resumeSkills: resumeSkills.length, matched: matched.length },
    metrics: { coverage, precision: +precision.toFixed(3), recall: +recall.toFixed(3), f1: +f1.toFixed(3) }
  }, null, 2);
});
