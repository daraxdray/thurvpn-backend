import http from "k6/http";
import { sleep } from 'k6';
export let option = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  vuse: 1000,
  duration: "20s"
};

export default () => {
  http.get("https://api.thurvpn.com/api/users/get/643878bce92ea2187c113c5a");
  sleep(1)  
};
