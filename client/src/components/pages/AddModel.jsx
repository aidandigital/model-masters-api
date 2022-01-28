import { Component } from "react";
import TextInput from "../forms/TextInput";
import ParagraphInput from "../forms/ParagraphInput";
import RadioButton from "../forms/radioButtons/RadioButton";
import MonthYearInput from "../forms/MonthYearInput";
import ImagesInput from "../forms/ImagesInput";
import SubmitButton from "../forms/SubmitButton";
import Label from "../forms/Label";
import Message from "../parts/Message";
import Note from "../parts/Note";
import Title from "../parts/Title";
import { Redirect } from "react-router-dom";
import Section from "../parts/Section";
import Spacer from "../parts/Spacer";
import axios from "axios";
import Header from "../parts/Header";
import Footer from "../parts/Footer";

class AddModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            completionMonth: "September",
            completionYear: "2020",
            facts: "",
            about: "",
            type: "Car",
            images: [],
            message: {},
            errType: '',
            success: false,
            model_id: null,
        }
    }

    setInput = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    setImagesInput = (newImages) => {
        this.setState({ images: newImages })
    }

    setMonthInput = (newValue) => {
        this.setState({ completionMonth: newValue});
    }

    setYearInput = (newValue) => {
        this.setState({ completionYear: newValue});
    }

    submitForm = (e) => {
        e.preventDefault();

        // !!! Must use FormData format in order to using multipart/form-data with axios
        let formData = new FormData();

        const regularFields = {
            name: this.state.name,
            completionMonth: this.state.completionMonth,
            completionYear: this.state.completionYear,
            facts: this.state.facts,
            about: this.state.about,
            type: this.state.type,
        }

        // Properly append multiple images to a single field for FormData
        this.state.images.forEach((image) => {
            formData.append("images", image, image.name)
        });

        console.log(this.state.images)

        // Append the rest of the fields to FormData
        for (var key in regularFields) {
            formData.append(key, regularFields[key]);
        }

        axios
          .post("/api/addModel", formData, {
            // !!! Headers nessecary to transport files, don't touch!
            headers: {
              accept: "application/json",
              "Accept-Language": "en-US,en;q=0.8",
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            },
          } 
        ).then((data) => {
            if (!data.data.success) {
                this.setState({ success: false, message: data.data.message, errType: data.data.errType });
            } else {
                this.setState({ success: true, model_id: data.data.model_id });
            }
        }).catch(() => {
            this.setState({success: false, message: {general: "An error occured, try again later"}})
        });;
    }

render() {
    return (
    <>
        <Header />
        <Section>
            <Title>Publish your Model</Title>
            <form className="w-full sm:w-4/5 md:w-3/5 m-auto">
                <Label>Model name</Label>
                <TextInput name="name" type="text" value={this.state.name} onChange={this.setInput} placeholder="Ex:  68' Dodge Charger" error={this.state.message.name} />
                <Label>Model type</Label>
                <div className="rounded-md border my-3" onChange={this.setInput}>
                    <span className="inline-block w-6/12">
                        <div><RadioButton name="type" value="Car" description="Car" defaultChecked /></div>
                        <div><RadioButton name="type" value="Tank" description="Tank" /></div>
                        <div><RadioButton name="type" value="Truck" description="Truck" /></div>
                    </span>
                    <span className="inline-block w-6/12">
                        <div><RadioButton name="type" value="Ship" description="Ship" /></div>
                        <div><RadioButton name="type" value="Train" description="Train" /></div>
                        <div><RadioButton name="type" value="Other" description="Other" /></div>
                    </span>
                </div>
                {this.state.message.type}
                <Label>About</Label>
                <ParagraphInput name="about" value={this.state.about} onChange={this.setInput} placeholder="Ex:  What color did you paint the engine? Did you do the trim? What color is the interior?" error={this.state.message.about} />
                <Label>Approximate completion date</Label>
                <MonthYearInput monthInputName="completionMonth" monthValue={this.state.completionMonth} yearValue={this.state.completionYear} yearInputName="completionYear" onChange={this.setInput} minYear="1940" defaultYear={new Date().getFullYear()} monthError={this.state.message.completionMonth} yearError={this.state.message.completionYear} />
                <Label>Photos</Label>
                <ImagesInput maxImages={8} customStateSetter={this.setImagesInput} value={this.state.images} error={this.state.message.images} />
                <div className="inline-block"><Label>Fun facts</Label></div>
                <div className="inline-block ml-1"><Note>(optional)</Note></div>
                <ParagraphInput name="facts" value={this.state.facts} onChange={this.setInput} placeholder="Are there any interesting facts about this model, mistakes you made, cool stories?" error={this.state.message.facts} />
                <Note>Seperate different facts above by hitting enter or return on your keyboard</Note>
                <Spacer height="3" />
                <SubmitButton onClick={this.submitForm}>Submit</SubmitButton>
                {(this.state.model_id ? <Redirect to={"/model/" + this.state.model_id}/> : <Message isSuccess={false} errType={this.state.errType}>{this.state.message.general}</Message>)}
            </form>
            <Spacer />
        </Section>
        <Footer />
    </>
    )
}
}

export default AddModel;