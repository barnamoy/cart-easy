import React from 'react'
import axios from 'axios';
// import Card from './../body/card/card'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import { Modal, InputGroup, FormControl, Button } from 'react-bootstrap';

// import { data } from 'jquery';

class deliverydetails extends React.Component {

  constructor(props) {

    super(props);
    let id = new URLSearchParams(this.props.location.search).get("id");
    this.state = {
      isLoaded: false,
      data: [],
      address: {},
      open: false,
      id: id,
      completed: 0
    }
    this.postObject = {
      name: "",
      email: "",
      phone: null,
      address: ""

    }

    this.fetch()

  }
  fetch = () => {
    axios.get('http://localhost:4000/order/' + this.state.id).then(res => {
      var datad = []
      this.setState({
        isLoaded: true,
        data: res.data.cart,
        address: res.data.address,
        completed: res.data.completed

      })

      console.log(this.state)
    })
  }

  handleNameChange = (e) => {
    this.postObject.name = e.target.value;

  }
  handleEmailChange = (e) => {
    this.postObject.email = e.target.value;
  }
  handlePhoneChange = (e) => {
    this.postObject.phone = e.target.value;
  }
  handleAddressChange = (e) => {
    this.postObject.address = e.target.value;
  }


  handleClickOpen = () => {
    this.setState({
      open: true
    })

  };

  handleClose = () => {
    this.setState({
      open: false
    })

  };
  placeOrder = () => {
    console.log('hi ')
    axios.post('http://localhost:4000/buy', this.postObject).then(res => {
      console.log(res.data)

    })
  }
  handleDeliveryRating = (seller) => {
    let deliveryrating = prompt("Rate your experience(1 to 5)");
    console.log(deliveryrating)
    if(deliveryrating == null){
      return
    }
    if(deliveryrating < 1 || deliveryrating > 5){
      alert("rating must be between 1 to 5")
      return

    }
    let id = new URLSearchParams(this.props.location.search).get("id");
    axios.post('http://localhost:4000/ratesellerbydeliveryboy', { seller: seller, orderNo: id, rating: deliveryrating }).then(
      res => {
        this.fetch();
        console.log(res);
      }
    )
    alert("Thank you for your valuable feedback");
  }
  deleteDuplicate = (arr) => {
    let idarr = []
    let objj = []
    for (let obj of arr) {
      if (idarr.includes(obj.item)) {
        continue
      }
      else {
        idarr.push(obj.item)
        objj.push(obj)

      }
    }
    let filteredData = []
    for (let i of objj) {
      let count = 0;
      for (let j of arr) {
        if (i.item == j.item) {
          count++
        }
      }
      i.count = count
      filteredData.push(i)
      // console.log(i)
    }
    console.log(filteredData)
    return filteredData

  }


  render() {
    if (this.state.isLoaded) {
      const data = this.state.data
      console.log("data is", data)
    }


    return (
      <div className="container">
        <div class="row">
          <div class="col bg-light">
            Name:{this.state.address.name}
            <br />
            Phone:{this.state.address.phone}
            <br />
            Address:{this.state.address.address}
            <br />
            Email:{this.state.address.email}
          </div>

          <div className="col">

          </div>
        </div>

        {/*<button onClick={()=>this.click()}> Buy Now</button>*/}
        <div>
          {/* <Button variant="outlined" color="primary" onClick={() => this.handleClickOpen()} >
            Buy Now
          </Button> */}
          <div class="row ">
            <div className="col container  mx-3 bg-white">

              {/* <h2>Shopping Cart</h2> */}
              {/* <div class="dropdown-divider"></div> */}

              {this.deleteDuplicate(this.state.data).map((item) => (
                <div key={item.id}>
                  <div style={{ textDecoration: 'none' }} to={"/product/" + item.item + "?from=cart"}>
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
                            <div class="text-danger">Eligible for FREE Shipping</div>
                            <div>Seller: {item.seller}</div>
                            <div>Estimated Delivery Time : 2hr</div>
                            <div class="row">
                              <input
                                type="tel"
                                class="form-control col-1 text-center m-1 h-25 ml-3"
                                value={item.count}
                              // style={{ width: "20%"}}
                              />
                              {!item.isratedbydeliveryboy &&

                                <button class="btn btn-primary h-25 ml-5" onClick={() => this.handleDeliveryRating(item.seller)}>Rate Seller</button>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>



                  </div>
                </div>
              ))}




            </div>

          </div>


        </div>
      </div>
    );

  }
}
export default deliverydetails