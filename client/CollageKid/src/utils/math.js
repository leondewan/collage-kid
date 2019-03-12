export const convertToHMS = (sec) => {
    const convertTo2dig = (num) => (num < 10) ? `0${num}`: num;
    var min = (sec - sec % 60)/60;
        hr = (min - min % 60)/60;

    return (hr ? convertTo2dig(hr) + ':' : '')
        + convertTo2dig(min) + ':' 
        + convertTo2dig(sec % 60);
}
