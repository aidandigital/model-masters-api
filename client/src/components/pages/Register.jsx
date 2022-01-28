import { Component } from "react";
import TextInput from "../forms/TextInput";
import RadioButton from "../forms/radioButtons/RadioButton";
import SubmitButton from "../forms/SubmitButton";
import Label from "../forms/Label";
import Popup from "../parts/Popup";
import Note from "../parts/Note";
import Spacer from "../parts/Spacer";
import Title from "../parts/Title";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            role: 'fan',
            password: '',
            message: {},
            success: false,
        }
    }

    setInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    submitForm = (e) => {
        e.preventDefault();
        axios.post('/api/register',
            {
                name: this.state.name,
                email: this.state.email,
                role: this.state.role,
                password: this.state.password
            }
        ).then((data) => {
            if (data.data.message) {
                this.setState({ message: data.data.message });
                this.setState({ success: false });
            } else {
                this.setState({ success: true });
            }
        })
}

render() {
    return (
        <Popup>
        <Title>Model Masters</Title>
        <form className="w-10/12 sm:w-3/5 md:w-1/2 lg:w-5/12 m-auto">
            <Label>Credentials</Label>
            <TextInput name="name" type="text" value={this.state.name} onChange={this.setInput} error={this.state.message.name} placeholder="Your full Name" />
            <TextInput name="email" type="email" value={this.state.email} onChange={this.setInput} error={this.state.message.email} placeholder="Your email" />
            <TextInput name="password" type="password" value={this.state.password} onChange={this.setInput} error={this.state.message.password} placeholder="Password" />
            <Label>Account type</Label>
            <div className="rounded-md border my-3" onChange={this.setInput}>
                <div><RadioButton name="role" value="fan" description="Fan" defaultChecked /></div>
                <div><RadioButton name="role" value="member" description="Member" /></div>
                <div><RadioButton locked={true} description="Model Master" /></div>
            </div>
            {this.state.message.role}
            <Note>Only your first name will be shared. Account type is flexible.</Note>
            <SubmitButton onClick={this.submitForm}>Sign up</SubmitButton>
            <div className="text-center"><span>Already have an account?</span><Link className="p-2 text-primarydark" to="login">Log in</Link></div>
        </form>
        <Spacer />
        {this.state.success ? <Redirect to="/home" /> : null}
        </Popup>
    )
}
}

export default Register;