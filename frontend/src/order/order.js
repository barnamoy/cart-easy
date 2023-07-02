import React from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
// import Card from './../body/card/card'



class order extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      isLoaded: false,
      data: [],
      open: false
    }
    this.fetch()



  }
  fetch = () => {
    if (localStorage.getItem('jwt') == null) {
      this.props.history.push('/login')
      return;
    }
    axios.get("http://localhost:4000/order").then((res, err) => {
      if (err) { console.log(err) }
      console.log(res.data)
      this.setState({
        isLoaded: true,
        data: res.data,
        open: false
      })
    })
  }
  handledetailbutton = (id) => {
    this.props.history.push("/orderdetails?id=" + id);
  }

  render() {
    const data = this.state.data



    return (
      <div className="container">
        <h1>Order History</h1>
        {this.state.data.reverse().map((item) => (
          <div key={item.id}>
            <div style={{ textDecoration: 'none' }} to={"/product/" + item.id + "?from=cart"}>
              {/* <Card
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                /> */}
              <div class="container  my-5 border rounded shadow p-3 mb-5">
                <div>
                  <div class="row">
                    <div class="col-lg-2 xs-col-6">
                      <img src={"http://localhost:4000/" + item.url} height="100px"  ></img>
                    </div>
                    <div class="col ml-4 ml-xs-0">
                      <div class="font-weight-bold">
                        {item.name}
                      </div>
                      <div class="float-right font-weight-bold" >₹{item.price}</div>
                      <div>Seller: {item.seller}</div>
                      <div class="row">
                        <div class="col">
                          <button class="btn btn-primary bt-sm float-right" onClick={() => this.handledetailbutton(item.orderNo)} >Details</button>
                          <button className="btn btn-primary bt-sm float-left" >Track Delivery Boy</button>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



            </div>
          </div>
        ))}
      </div>
    )
  }
}
export default order