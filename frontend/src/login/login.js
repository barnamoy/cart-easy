import React from 'react'
import axios from "axios";
import { Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
// import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { withStyles } from '@material-ui/core/styles';
import { useRef } from 'react'
import Custoster from './../toster/toster.js'
import './login.css'
const useStyles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

class Login extends React.Component {
  // inputRef = useRef(null);
  constructor(props) {
    super(props)
    this.inputRef = React.createRef();
    this.state = {
      username: '',
      password: '',
      checkbox: false
    };




    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }
  handleUsername(event) {
    this.setState({ username: event.target.value });

  }
  handlecheckbox = (event) => {
    this.setState({ checkbox: event.target.checked })
    console.log(event.target.checked)
  }
  handlePassword(event) {
    this.setState({ password: event.target.value });
  }
  handleSubmit = (event) => {
    console.log('props are', this.props)
    if(this.state.username=="" || this.state.password=="" )
    {
      alert("Please fill the form correctly");
      return ;
    }
    // return
    if (this.state.checkbox == true) {
      axios.post('http://localhost:4000/sellerlogin', { email: this.state.username, password: this.state.password }).then(res => {
        console.log(res)
        if (res.data.status === 'OK') {
          console.log("testing login for seller")
          localStorage.setItem('jwt', res.data.token);
          localStorage.setItem('role', res.data.role);
          axios.defaults.headers.common['authtoken'] = res.data.token

          this.props.history.push("/dashboard");
        }
      })
      event.preventDefault();
      return
    }

    axios('http://localhost:4000/login?username=' + this.state.username + '&&password=' + this.state.password).then(result => {
      console.log(result.data)
      if (result.data.status === 'ok') {
        localStorage.setItem('jwt', result.data.token);

        localStorage.setItem('role', "user");
        axios.defaults.headers.common['authtoken'] = result.data.token
        this.inputRef.current.seterr("success")
        this.props.history.push("/");
      }
      else {
        this.inputRef.current.seterr("something went wrong")
      }

    }).catch(error => {
      // We want to handle globally
    })
    event.preventDefault();
  }
  render() {
    const { classes } = this.props;
    return <Container component="main" maxWidth="xs">
      <Custoster ref={this.inputRef} msg={"err"} />
      <CssBaseline />
      <div className={classes.paper} >
        <Avatar >
          <LockOutlinedIcon className={classes.avatar} />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <form >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            onChange={this.handleUsername}
            autoFocus
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={this.handlePassword}
          />
          <FormControlLabel
            control={<Checkbox onChange={this.handlecheckbox} value="remember" color="primary" />}
            label="Login As a Seller"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={this.handleSubmit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link to="/register/" variant="body2" >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
      </Box>
    </Container>
  }
}
export default withStyles(useStyles)(Login)