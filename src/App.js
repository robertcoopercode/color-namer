import React, { Component } from 'react';
import './App.css';
import nearestColor from 'nearest-color';
import tinycolor from 'tinycolor2';
import 'flexi-color-picker';

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
            hexValue: null,
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

        // eslint-disable-next-line
        this.colorPicker = ColorPicker(

            document.getElementById('slider'),
            document.getElementById('picker'),

            (hex, hsv, rgb, pickerCoordinate, sliderCoordinate) => {
                // this.updateColor(null, hex);
                // eslint-disable-next-line
                ColorPicker.positionIndicators(
                    document.getElementById('slider-indicator'),
                    document.getElementById('picker-indicator'),
                    sliderCoordinate, pickerCoordinate
                );

                document.body.style.backgroundColor = hex;

                this.updateColor(null, hex);
            });

        // eslint-disable-next-line
        ColorPicker.fixIndicators(
            document.getElementById('slider-indicator'),
            document.getElementById('picker-indicator'));
        
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
        // if (this.updateColor(event) != false) { return this.colorPicker.setHex(this.state.currentColor.hexValue)};
    }

    updateColor = (event, value) => {
        // clearTimeout(this.state.timer);
        // this.setState({timer: setTimeout(() => { window.location.hash = colorValue }, 500)});

        const colorValue = value || event.target.value;
            
        console.log(colorValue)
        if( !tinycolor(colorValue).isValid() ){
            return false;
        }

        console.log('valid!')
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
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Color Namer</h1>
        </header>
          <div className="color-value-container">
            <div className="color-value  color-value--hex">
              <span  className="color-value__label">hex</span>
              <span className="color-value__value">{this.state.currentColor.hexValue}</span>
            </div>
            <div className="color-value  color-value--rgb">
              <span  className="color-value__label">rgb</span>
              <span className="color-value__value">{this.state.currentColor.rgbValue}</span>
            </div>
          </div>
          <span className="color-name">{this.state.currentColor.name}</span>
          <div id="picker-wrapper">
              <div id="picker"></div>
              <div id="picker-indicator"></div>
          </div>
          <div id="slider-wrapper">
              <div id="slider"></div>
              <div id="slider-indicator"></div>
          </div>
          <input value={this.state.value} onChange={this.handleColorChange} />
        {/*<LambdaDemo/>*/}
      </div>
    );
  }
}

export default App;
