import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface PortalPasswordEmailProps {
    password: string;
    url: string;
}

export const PortalPasswordEmail = ({
    password,
    url,
}: PortalPasswordEmailProps) => (
    <Html>
        <Head>
            <meta name="color-scheme" content="dark" />
            <meta name="supported-color-schemes" content="dark" />
        </Head>
        <Preview>Access the Max Brand Portal</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src="https://hbo-max-portal-stack.vercel.app/hbo-max-email-logo.png"
                    width={251}
                    height={69}
                    alt="Max"
                    style={logo}
                />

                <Hr style={hr} />

                <Text style={text}>
                    We have received your request for access to the HBO Max Brand Portal.
                    Please use the following password to log in:{' '}
                    <strong>{password}</strong>
                </Text>

                {/* @ts-ignore */}
                <Button pX={48} pY={16} style={button} href={url}>
                    Sign in
                </Button>

                <Hr style={hr} />

                <Text style={smallText}>© HBO Max. All rights reserved.</Text>
            </Container>
        </Body>
    </Html>
);

export default PortalPasswordEmail;

const fontFamily = {
    fontFamily:
        "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
};

const main = {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: 0,
    margin: 0,
};

const container = {
    backgroundColor: '#000000',
    padding: '45px',
    margin: '0 auto',
};

const logo = {
    height: '32px',
    minHeight: '32px',
    maxHeight: '32px',
    width: 'auto',
    // width: '120px',
    marginBottom: '24px',
    // color alt-text
    color: '#ffffff',
    ...fontFamily,
};

const hr = {
    width: '100%',
    border: 'none',
    borderTop: '1px solid #eaeaea',
    opacity: 0.2,
};

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: '24px',
    ...fontFamily,
};

const button = {
    backgroundColor: '#8298AB',
    borderRadius: '40px',
    color: '#000000',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    marginBottom: '24px',
    lineHeight: '100%',
    maxWidth: '100%',
    cursor: 'pointer',
    padding: '16px 48px',
    ...fontFamily,
};

const smallText = {
    margin: 0,
    fontSize: '12px',
    lineHeight: '26px',
    fontWeight: '300',
    color: '#ffffff',
    opacity: 0.6,
    ...fontFamily,
};
