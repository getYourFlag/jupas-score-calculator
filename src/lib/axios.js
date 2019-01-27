import axios from "axios";

const instance = axios.create({
    headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,HEAD,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    }
});

export default instance;