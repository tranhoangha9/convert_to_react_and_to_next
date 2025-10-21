'use client'
import React, { Component } from 'react';
import './Banner.css';

class Banner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: 0,
      isHovered: false
    };
  }

  componentDidMount() {
    this.startAuto();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startAuto = () => {
    this.timer = setInterval(() => {
      if (!this.state.isHovered) {
        this.setState(prev => ({
          currentSlide: (prev.currentSlide + 1) % 3
        }));
      }
    }, 6000);
  }

  next = () => {
    this.setState(prev => ({
      currentSlide: (prev.currentSlide + 1) % 3
    }));
  }

  prev = () => {
    this.setState(prev => ({
      currentSlide: (prev.currentSlide - 1 + 3) % 3
    }));
  }

  goTo = (index) => {
    this.setState({
      currentSlide: index
    });
  }

  onMouseEnter = () => {
    this.setState({ isHovered: true });
  }

  onMouseLeave = () => {
    this.setState({ isHovered: false });
  }

  render() {
    const { currentSlide } = this.state;
    
    return (
      <section 
        className="banner"
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
      <div className="banner-container">
        <div className="banner-slides">
          <div className={`banner-slide ${currentSlide === 0 ? 'active' : ''}`}>
            <div className="banner-images">
              <img src="/assets/images/bannerxin.png" alt="Banner 1" className="banner-img" loading="lazy" />
            </div>
            <div className="banner-content">
              <h1>Carry your Funk</h1>
              <p>Trendy handbags collection for your party animal</p>
              <button className="sm-btn">
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 12.5H19.5M19.5 12.5L15 8M19.5 12.5L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                See more
              </button>
            </div>
          </div>
          
          <div className={`banner-slide ${currentSlide === 1 ? 'active' : ''}`}>
            <div className="banner-images">
              <img src="/assets/images/bannerxin.png" alt="Banner 2" className="banner-img" loading="lazy" />
            </div>
            <div className="banner-content">
            <h1>Carry your Funk2</h1>
            <p>Trendy handbags collection for your party animal 2</p>
              <button className="sm-btn">
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 12.5H19.5M19.5 12.5L15 8M19.5 12.5L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                See more
              </button>
            </div>
          </div>
          
          <div className={`banner-slide ${currentSlide === 2 ? 'active' : ''}`}>
            <div className="banner-images">
              <img src="/assets/images/bannerxin.png" alt="Banner 3" className="banner-img" loading="lazy" />
            </div>
            <div className="banner-content">
            <h1>Carry your Funk3</h1>
            <p>Trendy handbags collection for your party animal 3</p>
              <button className="sm-btn">
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 12.5H19.5M19.5 12.5L15 8M19.5 12.5L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                See more
              </button>
            </div>
          </div>
        </div>
        
        <button className="banner-nav prev" onClick={this.prev}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button className="banner-nav next" onClick={this.next}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="banner-dots">
          <button 
            className={`dot ${currentSlide === 0 ? 'active' : ''}`}
            onClick={() => this.goTo(0)}
          ></button>
          <button 
            className={`dot ${currentSlide === 1 ? 'active' : ''}`}
            onClick={() => this.goTo(1)}
          ></button>
          <button 
            className={`dot ${currentSlide === 2 ? 'active' : ''}`}
            onClick={() => this.goTo(2)}
          ></button>
        </div>
      </div>
    </section>
    );
  }
}

export default Banner;