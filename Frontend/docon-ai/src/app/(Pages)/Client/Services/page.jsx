// Client/Services/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  FileText, 
  GitCompare, 
  FileSearch, 
  MessageCircle, 
  Calculator,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  Shield,
  Clock,
  TrendingUp,
  Layers,
  Brain
} from 'lucide-react';
import Header from '../../../Components/Common/Header';
import Footer from '../../../Components/Common/Footer';

const ServicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      id: 1,
      title: "Construction Project Management",
      description: "Comprehensive project oversight with AI-powered insights to keep your construction projects on track, on time, and within budget.",
      icon: <Building2 className="w-8 h-8" />,
      features: [
        "Real-time project tracking and monitoring",
        "Automated milestone and deadline management",
        "Resource allocation optimization",
        "Progress reporting and analytics",
        "Risk assessment and mitigation",
        "Integration with construction workflows"
      ],
      benefits: [
        "Reduce project delays by 40%",
        "Improve budget accuracy",
        "Enhanced stakeholder communication",
        "Real-time decision making"
      ],
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Team Management",
      description: "Streamline your workforce management with intelligent team coordination, task assignment, and performance tracking capabilities.",
      icon: <Users className="w-8 h-8" />,
      features: [
        "Smart team assignment and scheduling",
        "Performance tracking and analytics",
        "Communication and collaboration tools",
        "Skill-based task allocation",
        "Time tracking and attendance management",
        "Team productivity insights"
      ],
      benefits: [
        "Increase team productivity by 35%",
        "Better resource utilization",
        "Improved team coordination",
        "Enhanced accountability"
      ],
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      title: "Document Management",
      description: "Centralized document storage and management system with advanced organization, version control, and instant access capabilities.",
      icon: <FileText className="w-8 h-8" />,
      features: [
        "Centralized document repository",
        "Version control and history tracking",
        "Smart categorization and tagging",
        "Advanced search and filtering",
        "Access control and permissions",
        "Cloud-based storage and backup"
      ],
      benefits: [
        "Find documents 75% faster",
        "Eliminate version conflicts",
        "Secure document sharing",
        "Automated organization"
      ],
      color: "from-purple-500 to-violet-600"
    },
    {
      id: 4,
      title: "AI Powered Document Comparator",
      description: "Advanced AI technology that compares construction documents, identifies differences, and highlights critical changes instantly.",
      icon: <GitCompare className="w-8 h-8" />,
      features: [
        "Intelligent document comparison",
        "Change detection and highlighting",
        "Version difference analysis",
        "Side-by-side visual comparison",
        "Change impact assessment",
        "Automated comparison reports"
      ],
      benefits: [
        "99.5% accuracy in change detection",
        "Save 80% review time",
        "Prevent costly errors",
        "Ensure compliance"
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      id: 5,
      title: "AI Powered Document Summarization",
      description: "Extract key insights and create intelligent summaries from complex construction documents using advanced natural language processing.",
      icon: <FileSearch className="w-8 h-8" />,
      features: [
        "Automated document summarization",
        "Key insight extraction",
        "Critical information highlighting",
        "Multi-format document support",
        "Customizable summary lengths",
        "Technical specification analysis"
      ],
      benefits: [
        "Reduce reading time by 70%",
        "Quick decision making",
        "Better information retention",
        "Focus on critical details"
      ],
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 6,
      title: "AI Powered Chatbot",
      description: "Intelligent virtual assistant that answers construction-related questions, provides project insights, and guides users through complex processes.",
      icon: <MessageCircle className="w-8 h-8" />,
      features: [
        "24/7 intelligent assistance",
        "Construction domain expertise",
        "Natural language understanding",
        "Project-specific knowledge base",
        "Multi-language support",
        "Integration with project data"
      ],
      benefits: [
        "Instant answers anytime",
        "Reduce support tickets by 60%",
        "Improved user experience",
        "Consistent information delivery"
      ],
      color: "from-teal-500 to-green-600"
    },
    {
      id: 7,
      title: "AI Powered Cost Prediction",
      description: "Leverage machine learning algorithms to predict project costs accurately, identify cost overruns early, and optimize budget allocation.",
      icon: <Calculator className="w-8 h-8" />,
      features: [
        "Intelligent cost forecasting",
        "Budget variance analysis",
        "Cost optimization recommendations",
        "Market trend integration",
        "Risk-adjusted estimates",
        "Real-time cost tracking"
      ],
      benefits: [
        "95% cost prediction accuracy",
        "Prevent budget overruns",
        "Optimize resource allocation",
        "Data-driven budgeting"
      ],
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "7", label: "AI-Powered Services", icon: <Brain className="w-6 h-6" /> },
    { number: "99.5%", label: "Accuracy Rate", icon: <Target className="w-6 h-6" /> },
    { number: "75%", label: "Time Savings", icon: <Clock className="w-6 h-6" /> },
    { number: "100%", label: "Free to Use", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Construction Services
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
              Comprehensive{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                AI Solutions
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transform your construction workflow with our complete suite of AI-powered services 
              designed to streamline operations, enhance productivity, and drive project success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Our Services</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover how our AI-powered services can revolutionize your construction projects
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Service Header */}
                <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                      <p className="text-white/90 text-sm">{service.description}</p>
                    </div>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6 space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-blue-600" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Benefits
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {service.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center group`}
                  >
                    Try This Service
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                Seamless Integration
              </h2>
              <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                All our AI-powered services work together seamlessly to create a unified 
                construction management ecosystem that adapts to your workflow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-slate-700 text-lg">Unified data across all services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-slate-700 text-lg">Real-time synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-slate-700 text-lg">Cross-service analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-slate-700 text-lg">Single sign-on access</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                <div className="grid grid-cols-3 gap-4">
                  {services.slice(0, 6).map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center"
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg text-white mb-2`}>
                        {React.cloneElement(service.icon, { className: "w-6 h-6" })}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-tight">
                        {service.title.split(' ').slice(-2).join(' ')}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Brain className="w-4 h-4 mr-2" />
                    All Connected with AI
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Construction Projects?</h2>
            <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
              Experience the power of AI-driven construction management with our comprehensive suite of services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                Try All Services Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;