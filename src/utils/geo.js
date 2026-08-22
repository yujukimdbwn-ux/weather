import gridData from '../assets/gridData.json';

/*
 * 기상청 격자 <-> 위경도 변환
 * RE: 지구 반경(km), GRID: 격자 간격(km), SLAT1/2: 투영 위도, OLON/OLAT: 기준점
 */
const RE = 6371.00877; 
const GRID = 5.0; 
const SLAT1 = 30.0; 
const SLAT2 = 60.0; 
const OLON = 126.0; 
const OLAT = 38.0; 
const XO = 43; 
const YO = 136; 

export function dfs_xy_conv(code, v1, v2) {
    const DEGRAD = Math.PI / 180.0;
    const RADDEG = 180.0 / Math.PI;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    const rs = {};

    if (code === "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        let theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['nx'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['ny'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    return rs;
}

export function getLocationNameFromGrid(nx, ny) {
    const found = gridData.find(item => item.nx === nx && item.ny === ny);
    return found ? found.name : "알 수 없는 위치";
}

export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("이 브라우저에서는 위치 정보를 지원하지 않습니다."));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요."));
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    });
}
