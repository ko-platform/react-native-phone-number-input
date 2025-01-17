import React, {PureComponent} from "react";
import {View, Text, TouchableHighlight, Image, TextInput} from "react-native";
import CountryPicker, {
    getCallingCode,
    DARK_THEME,
    DEFAULT_THEME,
    CountryModalProvider,
    Flag,
} from "@ko-platform/country-picker-modal";
import {PhoneNumberUtil} from "google-libphonenumber";
import styles from "./styles";

const dropDown =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";
const phoneUtil = PhoneNumberUtil.getInstance();

export default class PhoneInput extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            code: props.defaultCode ? undefined : "91",
            number: props.value
                ? props.value
                : props.defaultValue
                    ? props.defaultValue
                    : "",
            modalVisible: false,
            countryCode: props.defaultCode ? props.defaultCode : "IN",
            disabled: props.disabled || false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.disabled !== prevState.disabled) {
            if ((nextProps.value || nextProps.value === "") && nextProps.value !== prevState.number) {
                return ({disabled: nextProps.disabled, number: nextProps.value});
            }
            return ({disabled: nextProps.disabled});
        }
        return null;
    };

    async componentDidMount() {
        const {defaultCode} = this.props;
        if (defaultCode) {
            const code = await getCallingCode(defaultCode);
            this.setState({code});
        }
    }

    // Used from PhoneInput.getCountryCode()
    getCountryCode = () => {
        return this.state.countryCode;
    };

    // Used from PhoneInput.getCallingCode()
    getCallingCode = () => {
        return this.state.code;
    };


    isValidNumber = (number) => {
        try {
            const {countryCode} = this.state;
            const parsedNumber = phoneUtil.parse(number, countryCode);
            return phoneUtil.isValidNumber(parsedNumber);
        } catch (err) {
            return false;
        }
    };

    onSelect = (country) => {
        const {onChangeCountry} = this.props;
        this.setState(
            {
                countryCode: country.cca2,
                code: country.callingCode[0],
            },
            () => {
                const {onChangeFormattedText} = this.props;
                if (onChangeFormattedText) {
                    if (country.callingCode[0]) {
                        onChangeFormattedText(
                            `+${country.callingCode[0]}${this.state.number}`
                        );
                    } else {
                        onChangeFormattedText(this.state.number);
                    }
                }
            }
        );
        if (onChangeCountry) {
            onChangeCountry(country);
        }
    };

    onChangeText = (text) => {
        this.setState({number: text});
        const {onChangeText, onChangeFormattedText} = this.props;
        if (onChangeText) {
            onChangeText(text);
        }
        if (onChangeFormattedText) {
            const {code} = this.state;
            if (code) {
                onChangeFormattedText(text.length > 0 ? `+${code}${text}` : text);
            } else {
                onChangeFormattedText(text);
            }
        }
    };

    // Used from PhoneInput.getNumberAfterPossiblyEliminatingZero()
    getNumberAfterPossiblyEliminatingZero() {
        let { number, code } = this.state;
        if (number.length > 0 && number.startsWith("0")) {
            number = number.substr(1);
            return { number, formattedNumber: code ? `+${code}${number}` : number };
        } else {
            return { number, formattedNumber: code ? `+${code}${number}` : number };
        }
    }

    renderDropdownImage = () => {
        return (
            <Image
                source={{uri: dropDown}}
                resizeMode="contain"
                style={styles.dropDownImage}
            />
        );
    };

    renderFlagButton = () => {
        const {layout = "first", flagSize} = this.props;
        const {countryCode} = this.state;
        if (["first", "both"].includes(layout)) {
            return (
                <View style={{width: flagSize + 5, paddingRight: 2, marginRight: 5}}>
                    <Flag
                        countryCode={countryCode}
                        flagSize={flagSize ? flagSize : DEFAULT_THEME.flagSize}
                    />
                </View>
            );
        }
        return <View/>;
    };

    render() {
        const {
            withShadow,
            withDarkTheme,
            codeTextStyle,
            textInputProps,
            textInputStyle,
            autoFocus,
            placeholder,
            disableArrowIcon,
            flagButtonStyle,
            containerStyle,
            textContainerStyle,
            renderDropdownImage,
            countryPickerProps = {},
            filterProps = {},
            countryPickerButtonStyle,
            layout = "first",
        } = this.props;
        const {modalVisible, code, countryCode, number, disabled} = this.state;
        return (
            <CountryModalProvider>
                <View
                    style={[
                        styles.container,
                        withShadow ? styles.shadow : {},
                        containerStyle ? containerStyle : {},
                    ]}
                >
                    <TouchableHighlight
                        style={[
                            styles.flagButtonView,
                            flagButtonStyle ? flagButtonStyle : {},
                            countryPickerButtonStyle ? countryPickerButtonStyle : {},

                        ]}
                        underlayColor={'#C5CED6'}
                        disabled={disabled}
                        onPress={() => this.setState({modalVisible: true})}
                    >
                        <>
                            <CountryPicker
                                modalProps={{
                                    presentationStyle: "pageSheet",
                                }}
                                onSelect={this.onSelect}
                                inverseHeaderOrder
                                withEmoji
                                withFilter
                                withFlag
                                filterProps={filterProps}
                                countryCode={countryCode}
                                withCallingCode
                                disableNativeModal={disabled}
                                visible={modalVisible}
                                theme={withDarkTheme ? DARK_THEME : DEFAULT_THEME}
                                renderFlagButton={this.renderFlagButton}
                                onClose={() => this.setState({modalVisible: false})}
                                {...countryPickerProps}
                            />
                            {code && ["second", "both"].includes(layout) && (
                                <Text
                                    allowFontScaling={false}
                                    style={[styles.codeText, codeTextStyle]}
                                >
                                    {`+${code}`}
                                </Text>
                            )}
                            {!disableArrowIcon && renderDropdownImage
                                ? renderDropdownImage
                                : this.renderDropdownImage()}
                        </>
                    </TouchableHighlight>
                    <View
                        style={[
                            styles.textContainer,
                            textContainerStyle ? textContainerStyle : {},
                        ]}
                    >
                        {code && layout === "first" && (
                            <Text
                                allowFontScaling={false}
                                style={[styles.codeText, codeTextStyle]}
                            >
                                {`+${code}`}
                            </Text>
                        )}
                        <TextInput
                            style={[styles.numberText, textInputStyle ? textInputStyle : {}]}
                            placeholder={placeholder ? placeholder : "Phone Number"}
                            onChangeText={this.onChangeText}
                            value={number}
                            editable={!disabled}
                            selectionColor="black"
                            keyboardAppearance={withDarkTheme ? "dark" : "default"}
                            keyboardType="number-pad"
                            autoFocus={autoFocus}
                            {...textInputProps}
                        />
                    </View>
                </View>
            </CountryModalProvider>
        );
    }
}
