import react, { useEffect, useState } from 'react'
import axios from 'axios';

function Sellerproduct(props) {
  const [arr, setarr] = useState([])

  function fetch() {
    if (localStorage.getItem('jwt') == null) {
      props.history.push('/login')
      return
    }
    axios.get('http://localhost:4000/sellerproducts').then(res => {
      console.log(res)
      setarr(res.data)

    })
  }
  useEffect(() => {
    fetch()
  }, [])

  function handledelete(id) {
    console.log(id)
    axios.delete('http://localhost:4000/sellerproducts?id=' +id , { id: id }).then(res => {
      console.log(res)
      fetch()
    })
  }
  return (
    <div class="container py-3">
      <h2>My stock</h2>
      {arr.map((item, index) => (
        <div key={item.id}>
          <div style={{ textDecoration: 'none' }} >
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
                    <img src={"http://localhost:4000/" + item.imgurl} height="100px"  ></img>
                  </div>
                  <div class="col ml-4 ml-xs-0">
                    <div class="font-weight-bold">
                      {item.name}
                    </div>
                    <div class=" font-weight-bold" >
                      <div>
                        Price : ₹{item.price}
                      </div>
                      <button class="btn btn-primary h-25 ml-5 float-right" onClick={() => props.history.push("/product/" + item.id)} >Details</button>
                    </div>
                    <div class="text-danger">Eligible for FREE Shipping</div>
                    <div>Seller: {item.seller}</div>
                    <div>Estimated Delivery Time : 2hr</div>
                    <div class="row">
                      {/* <input
                        type="tel"
                        class="form-control col-1 text-center m-1 h-25 ml-3"
                        value={item.count}
                        // style={{ width: "20%"}}
                      /> */}
                      <button class="btn btn-primary h-25 ml-5" onClick={() => handledelete(item.id)} >Delete</button>


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

export default Sellerproduct