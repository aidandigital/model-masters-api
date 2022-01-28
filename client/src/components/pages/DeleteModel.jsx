import { Component } from "react";
import TextInput from "../forms/TextInput";
import RadioButton from "../forms/radioButtons/RadioButton";
import SubmitButton from "../forms/SubmitButton";
import Label from "../forms/Label";
import Message from "../parts/Message";
import Title from "../parts/Title";
import Section from "../parts/Section";
import Spacer from "../parts/Spacer";
import axios from "axios";
import Header from "../parts/Header";

class AddModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model_id: props.data.model_id,
            reason: "",
            message: {},
            password: "",
            success: false,
            errType: "",
        }
    }

    setInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    submitForm = (e) => {

        e.preventDefault();

            axios.post('/api/deleteModel',
                {
                    model_id: this.state.model_id,
                    reason: this.state.reason,
                    password: this.state.password,
                }
            ).then((data) => {
                if (!data.data.success) {
                    this.setState({ success: false, message: data.data.message, errType: data.data.errType });
                } else {
                    this.setState({ success: true });
                }
            }).catch(() => {
                this.setState({success: false, message: {general: "An error occured, try again later"}})
            });;
    }

render() {
    return (
    <>
      {this.state.success ?
      <>
      <Header />
        <Section>
          <Title>Successfully Deleted</Title>
          <p className="text-center">We are sorry to see your model go!</p>
        </Section>
      </>
      :
      <>
        <Header />
        <Section>
            <Title>Delete a Model</Title>
            <form className="w-full sm:w-4/5 md:w-3/5 m-auto">
                <Label>Model ID</Label>
                <TextInput disabled="disabled" name="name" type="text" value={this.state.model_id} error={this.state.message.model_id} />
                {/*
                <Label>Reason for deletion</Label>
                <div className="rounded-md border my-3" onChange={this.setInput}>
                    <div><RadioButton name="reason" value="privacy" description="I just want this model removed" /></div>
                    <div><RadioButton name="reason" value="accident" description="I accidentally published this" /></div>
                    <div><RadioButton name="reason" value="sensitive" description="I submitted sensitive info" /></div>
                    <div><RadioButton name="reason" value="error" description="An error occured making this" /></div>
                    <div><RadioButton name="reason" value="remake" description="I'm going to re-publish this" /></div>
                    <div><RadioButton name="reason" value="other" description="Other" /></div>
                </div>
                {this.state.message.type}
                */}
                <Label>Password</Label>
                <TextInput name="password" type="password" onChange={this.setInput} value={this.state.password} error={this.state.message.password} placeholder="Enter your password to verify this" />
                <Spacer height="3" />
                <SubmitButton onClick={this.submitForm}>Delete forever</SubmitButton>
                {(this.state.success ? null : <Message isSuccess={false} errType={this.state.errType}>{this.state.message.general}</Message>)}
            </form>
            <Spacer />
        </Section>
        </>
      }
    </>
    )
}
}

export default AddModel;