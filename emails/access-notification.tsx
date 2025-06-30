import { Access } from '@/types';
import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface Props {
    name: string;
    access: Access;
    url: string;
}

export const AccessNotification = ({
    name = 'Chloe Smith',
    access = 'Approved',
    url = 'https://brand.hbomax.com/access-granted',

}: Props) => {
    const currentYear = new Date().getFullYear();

    const message =
        access === 'Approved' ? (
            <>
                {`Your request for access has been approved. Welcome to the HBO Max Brand Portal! Sign in at `}
                <Link
                    href={url}
                    style={{
                        color: '#8298AB',
                        textDecoration: 'underline',
                    }}
                >
                    {url}
                </Link>
                {` or click the button below.`}
            </>
        ) : (
            <>
                {`Your request for access to the HBO Max Brand Portal has been
                denied. Please contact your Max representative or `}
                <Link
                    href="mailto:HBOMax_Brand_Team@wbd.com."
                    style={{
                        color: '#8298AB',
                        textDecoration: 'underline',
                    }}
                >
                    HBOMax_Brand_Team@wbd.com.
                </Link>
                {` for more
                information.`}
            </>
        );

    return (
        <Html>
            <Head>
                <meta name="color-scheme" content="dark" />
                <meta name="supported-color-schemes" content="dark" />
            </Head>
            <Preview>Access the Max Brand Portal</Preview>
            <Body style={main}>
                <Container
                    style={{
                        backgroundColor: '#000000',
                        padding: '45px',
                        margin: '0 auto',
                    }}
                >
                    <Img
                        src="https://hbo-max-portal-stack.vercel.app/HBO-Max-Refresh.png"
                        width={251}
                        height={69}
                        alt="Max"
                        style={logo}
                    />

                    <Hr style={hr} />
                    <Text
                        style={{
                            ...text,
                            marginBottom: 0,
                        }}
                    >{`Hi ${name},`}</Text>
                    <Text style={text}>{message}</Text>

                    {access === 'Approved' && (
                        <Button
                            // @ts-ignore
                            style={button}
                            href={url}
                        >
                            Sign in
                        </Button>
                    )}

                     <Hr style={hr} />
                   
                </Container>
            </Body>
        </Html>
    );
};

export default AccessNotification;

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
    color: '#ffffff',
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
