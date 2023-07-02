import { initStore } from "../../../src/client/store";
import api from "./ExampleApiMock";
import cart from "./CartMock"
const store = initStore(api, cart);
export default store;