import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1>Something went wrong.</h1>
          <p>We're sorry for the inconvenience.</p>
          <button onClick={this.handleReset} style={styles.button}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
    border: "1px solid red",
    backgroundColor: "#ffe6e6",
  },
  button: {
    padding: "8px 16px",
    marginTop: "10px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
  },
};

export default ErrorBoundary;
