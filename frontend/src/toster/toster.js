import React from "react";
import { Row, Col, Toast, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, render } from "react";
import  './toster.css'
// const [show, setShow] = useState(true);
class custoster extends React.Component {
  constructor(props){
    super(props);
    this.seterr = this.seterr.bind(this);
    console.log('props are ' , props)
    this.state = { 
      show: false,
      msg:""
    };
    
  }
  seterr(m){
    this.setState({show:true , msg:m})
    console.log('call from parent')
  }
  render() {
    
    return <div className="custoast" >
    <Row>
      <Col xs={12}>
        <Toast  onClose={()=>this.setState({show:false}) } show={this.state.show} delay={3000} autohide >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded mr-2"
              alt=""
            />
            <strong className="mr-auto">Bootstrap</strong>
            <small>11 mins ago</small>
          </Toast.Header>
          <Toast.Body>{this.state.msg}</Toast.Body>
        </Toast>
      </Col>
     
    </Row>
    </div>;
  }
}
export default custoster;