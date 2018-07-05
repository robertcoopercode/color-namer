import React, { Component } from 'react';
import './App.css';
import nearestColor from 'nearest-color';
import tinycolor from 'tinycolor2';

class LambdaDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false, msg: null};
  }
  
  handleClick = (e) => {
    e.preventDefault();

    this.setState({loading: true});
    fetch('/.netlify/functions/hello')
      .then(response => response.json())
      .then(json => this.setState({loading: false, msg: json.msg}));
  }

  render() {
    const {loading, msg} = this.state;

    return <p>
      <button onClick={this.handleClick}>{loading ? 'Loading...' : 'Call Lambda'}</button><br/>
      <span>{msg}</span>
    </p>
  }
}

class App extends Component {
    state = {
        nearestColors: null,
        timer: 0,
        currentColor: {
            name: null,
            Value: null,
            hexValue: '',
            rgbValue: null,
        }
    }
    
    componentDidMount() {
        fetch('https://api.color.pizza/v1/')
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                this.getColors(response.colors);
            })

        // if ( !Modernizr.inputtypes.color ) {
        //     const $c = document.querySelector("input[type='color']");
        //     $c.classList.add("{hash:true}");
        //     $c.setAttribute("onchange", "up(this.jscolor)");
        //     $c.setAttribute("type", "button");
        //     var picker = new jscolor($c);
        //     window.up = (event) => {
        //         let value = tinycolor($c.style['background-color']).toHexString();
        //         this.updateColor(event, value)
        //     }
        // }
    }
    
    getColors = (colors) => {
        let mappedColors = {};
        colors.forEach(function(entry){
            mappedColors[entry.name] = entry.hex;
        });
        this.setState({nearestColors: nearestColor.from(mappedColors)});

        const hash = window.location && window.location.hash;

        if (hash) {
            this.updateColor(null, hash);
        } else {
            this.updateColor(null, '#'+Math.floor(Math.random()*16777215).toString(16));
        }

        setTimeout(() => {
            // this.$el.classList.remove('is-hidden');
        },10);

        setTimeout(() => {
            // document.querySelector('input[type="text"]').focus();
        },2000);
    }
    
    handleColorChange = (event) => {
        this.updateColor(event);
    }

    updateColor = (event, value) => {
        // clearTimeout(this.state.timer);
        // this.setState({timer: setTimeout(() => { window.location.hash = colorValue }, 500)});

        const colorValue = value || event.target.value;
            
        if( !tinycolor(colorValue).isValid() ){
            return false;
        }

        let color = this.state.nearestColors(tinycolor(colorValue).toHexString());
        
        this.setState({
            currentColor: {
                name: color.name,
                Value: colorValue,
                hexValue: color.value,
                rgbValue: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
            }
        })

        let complement = tinycolor(colorValue).complement();
        this.setState((previousState) => {
            return {
                currentColor: {
                    ...previousState.currentColor,
                    contrastValue: tinycolor.mostReadable(colorValue, [
                        complement.toHexString(),
                        complement.saturate(20).toHexString(),
                        complement.saturate(30).toHexString(),
                        complement.brighten(20).toHexString(),
                        complement.brighten(30).toHexString(),
                        complement.darken(20).toHexString(),
                        complement.darken(30).toHexString(),
                        complement.lighten(20).toHexString(),
                        complement.lighten(30).toHexString(),
                        complement.desaturate(20).toHexString(),
                        complement.desaturate(30).toHexString(),
                    ],{
                        includeFallbackColors:true,
                        level:"A",
                        size:"small"
                    }).toHexString()
                }
            }
        })
    }
    
    render() {
    return (
      <div className="color-namer">
          <h1 className="color-namer__title">Color Namer</h1>
          <span className="color-namer__name">{this.state.currentColor.name}</span>
          <div className="color-namer__preview-container">
              <div 
                  className="color-namer__preview"
                  style={{
                          backgroundColor: this.state.currentColor.hexValue
                  }} 
              >
                <input className="color-namer__color-input" type="color" onChange={this.handleColorChange} value={this.state.currentColor.hexValue} />
              </div>
              <span className="color-namer__preview-info">
                  {'< click for a color picker'}
              </span>
          </div>
          <div className="color-namer__value-container">
            <div className="color-namer__value  color-namer__value--hex">
              <span  className="color-namer__value-label">hex</span>
              <span className="color-namer__value-text">{this.state.currentColor.hexValue}</span>
            </div>
            <div className="color-namer__value  color-namer__value--rgb">
              <span  className="color-namer__value-label">rgb</span>
              <span className="color-namer__value-text">{this.state.currentColor.rgbValue}</span>
            </div>
          </div>
          <input className="color-input" value={this.state.value} onChange={this.handleColorChange} />
        {/*<LambdaDemo/>*/}
      </div>
    );
  }
}

export default App;
