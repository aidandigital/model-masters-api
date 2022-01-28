import { Component } from "react";
import TextInput from "../forms/TextInput";
import ParagraphInput from "../forms/ParagraphInput";
import RadioButton from "../forms/radioButtons/RadioButton";
import SubmitButton from "../forms/SubmitButton";
import Label from "../forms/Label";
import Message from "../parts/Message";
import Title from "../parts/Title";
import Section from "../parts/Section";
import Spacer from "../parts/Spacer";
import Note from "../parts/Note";
import TinyLoader from "../forms/TinyLoader";
import axios from "axios";
import Header from "../parts/Header";
import Footer from "../parts/Footer";

class ReportIssue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: "",
            description: "",
            type: "error",
            loading: false,
            message: {},
            success: false,
            errType: "",
        }
    }

    setInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    submitForm = (e) => {

        e.preventDefault();

        this.setState({loading: true})

            axios.post('/api/reportIssue',
                {
                    url: this.state.url,
                    type: this.state.type,
                    description: this.state.description,
                }
            ).then((data) => {
                this.setState({loading: false})
                if (!data.data.success) {
                    this.setState({ success: false, message: data.data.message, errType: data.data.errType });
                } else {
                    this.setState({ success: true });
                }
            }).catch(() => {
                this.setState({loading: false})
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
          <Title>Issue Successfully Reported</Title>
          <p className="text-center">Thank you for taking the time to make Model Masters better!</p>
        </Section>
      </>
      :
      <>
        <Header />
        <Section>
            <Title>File a Report</Title>
            <form className="w-full sm:w-4/5 md:w-3/5 m-auto">
                <Label>Type of Issue</Label>
                <div className="rounded-md border my-3" onChange={this.setInput}>
                    <div><RadioButton name="type" value="error" description="I'm reporting an error/issue that occured" defaultChecked/></div>
                    <div><RadioButton name="type" value="model" description="I'm reporting an innapropriate model" /></div>
                    <div><RadioButton name="type" value="user" description="I'm reporting a innapropriate user" /></div>
                </div>
                {this.state.message.type}
                <Label>URL of the Issue</Label>
                <TextInput name="url" type="text" value={this.state.url} onChange={this.setInput} error={this.state.message.url} placeholder="Paste the url of the problem here" />
                {this.state.message.type}
                <Label>Description of the Issue</Label>
                <ParagraphInput name="description" onChange={this.setInput} value={this.state.password} error={this.state.message.description} placeholder={this.state.type === "error" ? "Provide as much detail as you can regarding what happened" : (["model", "user"].includes(this.state.type) ? "How is the user/model in question damaging the integrity of the site?" : "")} />
                <Spacer height="3" />
                <SubmitButton onClick={this.submitForm}>Report</SubmitButton>
                {this.state.loading ?<div className="inline-block relative top-3 mr-3 ml-2"><TinyLoader /></div> : null}
                <div className="inline-block"><Note>Submission could take a minute, please be patient</Note></div>
                {(this.state.success ? null : <Message isSuccess={false} errType={this.state.errType}>{this.state.message.general}</Message>)}
            </form>
            <Spacer />
        </Section>
        <Footer />
      </>
      }
    </>
    )
}
}

export default ReportIssue;