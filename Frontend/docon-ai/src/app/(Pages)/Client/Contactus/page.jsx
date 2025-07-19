"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, Globe, Users, XCircle } from 'lucide-react'; // Added XCircle for error
// Assuming Header and Footer paths are correct relative to this file
import Header from '../../../Components/Common/Header'; 
import Footer from '../../../Components/Common/Footer'; 

// Placeholder for Header and Footer components if they are not available in this environment
const Header = () => (
  <header className="bg-white shadow-sm py-4 px-6 fixed top-0 w-full z-10">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">DoconAI</h1>
      <nav>
        <ul className="flex space-x-6">
          <li><a href="/" className="text-slate-700 hover:text-blue-600 transition-colors">Home</a></li>
          <li><a href="/features" className="text-slate-700 hover:text-blue-600 transition-colors">Features</a></li>
          <li><a href="/pricing" className="text-slate-700 hover:text-blue-600 transition-colors">Pricing</a></li>
          <li><a href="/contact" className="text-blue-600 font-semibold">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-800 text-white py-10 px-6">
    <div className="max-w-6xl mx-auto text-center">
      <p>&copy; {new Date().getFullYear()} DoconAI. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
);


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '', // This is now the ONLY email field, for the user's email
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null); // New state for error messages

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null); // Clear previous errors

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact/send-email', { // Adjust URL if your FastAPI is on a different port/host
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong on the server.');
      }

      const result = await response.json();
      console.log('Success:', result);
      setIsSubmitted(true);
      
      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 3000); // Display success message for 3 seconds

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message); // Set the error message
      setIsSubmitted(false); // Ensure success state is false
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "contact@DoconAI.com",
      description: "We'll respond within 24 hours",
      href: "mailto:contact@DoconAI.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+1 (234) 567-8900",
      description: "Mon-Fri 9AM-6PM EST",
      href: "tel:+1234567890"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "123 Construction Ave",
      description: "Tech City, TC 12345",
      href: "#"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      content: "Mon-Fri: 9AM-6PM",
      description: "Weekend: 10AM-4PM EST",
      href: "#"
    }
  ];

  const whyContactUs = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "General Inquiries",
      description: "Questions about DoconAI features, pricing, or general information"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Partnership Opportunities",
      description: "Interested in partnering with us or integrating our AI technology"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Technical Support",
      description: "Need help with installation, setup, or troubleshooting issues"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-inter">
      <Header />
      
      {/* Compact Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
              <Mail className="w-4 h-4 mr-2" />
              We'd Love to Hear From You
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
              Get in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Touch
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about DoconAI? We're here to help you transform your 
              construction document management workflow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 text-white">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{info.title}</h3>
                <p className="text-blue-600 font-medium mb-1">{info.content}</p>
                <p className="text-slate-600 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form - Takes 2/3 width */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Send us a Message</h2>
                <p className="text-slate-600 mb-8">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="+1 (234) 567-8900"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white"
                      placeholder="Tell us more about your inquiry and how we can help..."
                    />
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-3 text-sm text-red-800 rounded-lg bg-red-50"
                      role="alert"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      <div>{submitError}</div>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    whileHover={{ scale: isSubmitting || isSubmitted ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting || isSubmitted ? 1 : 0.98 }}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                      isSubmitted
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : isSubmitting
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="mr-2 w-5 h-5" />
                        Message Sent!
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Why Contact Us - Takes 1/3 width */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1 space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">How Can We Help?</h2>
                <p className="text-slate-600 mb-8">
                  We're here to support you with any questions or assistance you need with DoconAI.
                </p>
              </div>

              <div className="space-y-6">
                {whyContactUs.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <a href="mailto:contact@DoconAI.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      contact@DoconAI.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-800 transition-colors">
                      +1 (234) 567-8900
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">
              Quick answers to common questions about DoconAI
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How accurate is the AI document analysis?",
                answer: "Our AI achieves 99.5% accuracy in document analysis, trained specifically on construction industry documents and continuously improved through machine learning."
              },
              {
                question: "What file formats do you support?",
                answer: "We support all major file formats including PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and many others commonly used in construction projects."
              },
              {
                question: "Is DoconAI really free to use?",
                answer: "Yes, DoconAI is completely free to use with all features included. There are no hidden fees, subscriptions, or premium tiers."
              },
              {
                question: "How long does document analysis take?",
                answer: "Most documents are analyzed within seconds. Complex blueprints or large documents may take up to a few minutes, but you'll see results in real-time."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we use enterprise-grade security with end-to-end encryption and strict data privacy protocols to protect your sensitive information."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-3">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-cyan-100 mb-8 leading-relaxed">
              Join thousands of construction professionals who trust DoconAI
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/Pages/Signup'}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              Try DoconAI Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;

