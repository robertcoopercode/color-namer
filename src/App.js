/* global Modernizr, jscolor */

import React, { Component } from 'react';
import './App.css';
import nearestColor from 'nearest-color';
import tinycolor from 'tinycolor2';
import './Modernizr';
import 'jscolor-picker';

class App extends Component {
    state = {
        isLoading: true,
        currentColor: {
            name: null,
            hexValue: '',
            rgbValue: null,
        },
        colorList: 'default',
        isInputTypeSupported: true,
        possibleColorLists: ['default'],
        listDescriptions: {
            default: {
                title: 'Default',
                description: 'The default color list',
                colorCount: 0,
            },
        },
    };

    componentDidMount() {
        Promise.all([
            this.fetchColorLists(),
            this.fetchColorsForColorList(this.state.colorList),
        ]).finally(() => {
            // Select a random color once all the colors have been loaded
            this.updateColor(
                '#' + ('000000' + ((Math.random() * 0xffffff) << 0).toString(16)).slice(-6)
            );
            this.setState({ isLoading: false });
        });

        // Setup a listener for the color picker
        if (!Modernizr.inputtypes.color) {
            this.setState({ isInputTypeSupported: false });
            new jscolor(document.querySelector('.color-namer__color-input'));
            document
                .querySelector('.color-namer__color-input')
                .setAttribute('onchange', 'updateColor(this.jscolor)');
            window.updateColor = () => {
                let color = tinycolor(
                    document.querySelector('.color-namer__color-input').style['background-color']
                ).toHexString();
                this.updateColor(color);
            };
        }
    }

    fetchColorLists = () => {
        return fetch('https://api.color.pizza/v1/lists/')
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                this.setState({
                    possibleColorLists: response.availableColorNameLists.filter((list) => {
                        return list !== 'colors';
                    }),
                    listDescriptions: response.listDescriptions,
                });
            });
    };

    fetchColorsForColorList = (colorList) => {
        return fetch(`https://api.color.pizza/v1/?list=${colorList}`)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                let mappedColors = {};

                for (const entry of response.colors) {
                    mappedColors[entry.name] = entry.hex;
                }

                this.nearestColors = nearestColor.from(mappedColors);

                this.setState({ isLoading: false });

                this.colorInput.focus();
            });
    };

    setNewColorList = (event) => {
        this.setState({ isLoading: true });
        const colorList = event.target.value;
        this.setState({ colorList });
        this.fetchColorsForColorList(colorList).finally(() => {
            // Need to update the color in state with the new color list colors
            this.updateColor(this.state.currentColor.hexValue);
            this.setState({ isLoading: false });
        });
    };

    updateColor = (value) => {
        const colorValue = value;

        let validFormat =
            tinycolor(colorValue).getFormat() === 'name' ||
            tinycolor(colorValue).getFormat() === 'rgb' ||
            tinycolor(colorValue).getFormat() === 'hex';
        let validColor = tinycolor(colorValue).isValid();

        if (!validColor || !validFormat) {
            return false;
        }

        const color = this.nearestColors(tinycolor(colorValue).toHexString());

        this.setState({
            currentColor: {
                name: color.name,
                hexValue: tinycolor(colorValue).toHexString(),
                rgbValue: tinycolor(colorValue).toRgbString(),
            },
        });
    };

    formatColorListTitle = (list) => {
        if (list === 'default') {
            return 'Default';
        }
        return this.state.listDescriptions[list].title;
    };

    render() {
        const Loader = () => (
            <div className="bouncing-loader">
                <div />
                <div />
                <div />
            </div>
        );

        return (
            <div className="color-namer">
                <a
                    className="github-badge-link"
                    href="https://github.com/robertcoopercode/color-namer"
                >
                    <span className="github-badge">View the Code</span>
                </a>
                <h1 className="color-namer__title">Color namer</h1>
                <div className="color-namer__center-container">
                    {!this.state.isLoading ? (
                        <React.Fragment>
                            <span className="color-namer__name">
                                {this.state.currentColor.name}
                            </span>
                            <div className="color-namer__preview-container">
                                <div
                                    className="color-namer__preview"
                                    style={{
                                        backgroundColor: this.state.currentColor.hexValue,
                                    }}
                                >
                                    {this.state.isInputTypeSupported ? (
                                        <input
                                            className="color-namer__color-input"
                                            type="color"
                                            onChange={(event) =>
                                                this.updateColor(event.target.value)
                                            }
                                            value={this.state.currentColor.hexValue}
                                        />
                                    ) : (
                                        <input
                                            className="color-namer__color-input"
                                            type="button"
                                            onChange={(event) =>
                                                this.updateColor(event.target.value)
                                            }
                                            value={this.state.currentColor.hexValue}
                                        />
                                    )}
                                </div>
                                <span className="color-namer__preview-info">
                                    {'click for a color picker'}
                                </span>
                            </div>
                            <div className="color-namer__value-container">
                                <div className="color-namer__value  color-namer__value--hex">
                                    <span className="color-namer__value-label">hex</span>
                                    <span className="color-namer__value-text">
                                        {this.state.currentColor.hexValue}
                                    </span>
                                </div>
                                <div className="color-namer__value  color-namer__value--rgb">
                                    <span className="color-namer__value-label">rgb</span>
                                    <span className="color-namer__value-text">
                                        {this.state.currentColor.rgbValue}
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <Loader />
                    )}
                    <input
                        className="color-input"
                        autoComplete="off"
                        autoCapitalize="off"
                        placeholder={this.state.currentColor.hexValue}
                        onChange={(event) => this.updateColor(event.target.value)}
                        ref={(input) => (this.colorInput = input)}
                    />
                    <div className="color-namer__lists">
                        <label className="color-namer__list-label">
                            <strong className="color-namer__list-label-text">Color list</strong>
                            <select
                                className="list-select"
                                value={this.state.colorList}
                                onChange={this.setNewColorList}
                            >
                                {this.state.possibleColorLists.map((list) => (
                                    <option key={list} value={list}>
                                        {this.formatColorListTitle(list)}
                                        &nbsp;(
                                        {this.state.listDescriptions[list].colorCount})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p className="color-namer__lists-description">
                            {this.state.listDescriptions[this.state.colorList].description}
                        </p>
                    </div>
                </div>
                <div className="color-namer__bottom-container">
                    <div className="bottom-container-section  bottom-container-section--features">
                        <h3 className="bottom-container-section__title">Features</h3>
                        <ul className="bottom-container-section__list">
                            <li className="bottom-container-section__item">
                                Over 30,000 color names
                            </li>
                            <li className="bottom-container-section__item">
                                Accepts both hex and rgb formats
                            </li>
                            <li className="bottom-container-section__item">Color picker</li>
                        </ul>
                    </div>
                    <div className="bottom-container-section  bottom-container-section--instructions">
                        <h3 className="bottom-container-section__title">Accepted input formats</h3>
                        <ul className="bottom-container-section__list">
                            <li className="bottom-container-section__item">
                                hex with hash (e.g.{' '}
                                <span className="bottom-container-section__highlight">#323</span> or{' '}
                                <span className="bottom-container-section__highlight">#332233</span>
                                )
                            </li>
                            <li className="bottom-container-section__item">
                                hex without hash (e.g.{' '}
                                <span className="bottom-container-section__highlight">323</span> or{' '}
                                <span className="bottom-container-section__highlight">332233</span>)
                            </li>
                            <li className="bottom-container-section__item">
                                rgb (e.g.{' '}
                                <span className="bottom-container-section__highlight">
                                    rgb(103, 33, 158)
                                </span>
                                )
                            </li>
                            <li className="bottom-container-section__item">
                                supported CSS color names (e.g.{' '}
                                <span className="bottom-container-section__highlight">red</span>)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
