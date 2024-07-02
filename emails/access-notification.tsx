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
    url = 'https://brand.max.com/access-granted',

}: Props) => {
    const currentYear = new Date().getFullYear();

    const message =
        access === 'Approved' ? (
            <>
                {`Your request for access has been approved. Welcome to the Max Brand Portal! Sign in at `}
                <Link
                    href={url}
                    style={{
                        color: '#00F0FF',
                        textDecoration: 'underline',
                    }}
                >
                    {url}
                </Link>
                {` or click the button below.`}
            </>
        ) : (
            <>
                {`Your request for access to the Max Brand Portal has been
                denied. Please contact your Max representative or `}
                <Link
                    href="mailto:MaxBrandPortalAccess@wbd.com"
                    style={{
                        color: '#00F0FF',
                        textDecoration: 'underline',
                    }}
                >
                    MaxBrandPortalAccess@wbd.com
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
                        backgroundColor: '#002BE7',
                        padding: '45px',
                        margin: '0 auto',
                    }}
                >
                    <Img
                        src="https://max-portal-stack.vercel.app/max-logo.png"
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
                     <Text style={text}>
                     <Link href="" style={{fontWeight: 'bold', color: '#ffffff', textDecoration: 'none'}}>Please note</Link><Link href="" style={{fontWeight: 'normal', color: '#ffffff', textDecoration: 'none'}}> that the name of the product in Belgium and the Netherlands is HBO Max, not Max. Any assets that may be used in that region must utilize the appropriate HBO Max branding.</Link>
                    </Text>
                    <Text style={text}>
                    {`Please contact `}
                <Link
                    href="mailto:StreamingCreativeEMEA@wbd.com"
                    style={{
                        color: '#00F0FF',
                        textDecoration: 'underline',
                    }}
                >
                     StreamingCreativeEMEA@wbd.com
                </Link>
                {` for Belgium & Netherlands branding.`}
                </Text>
                   
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
    backgroundColor: '#002BE7',
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
    backgroundColor: '#00F0FF',
    borderRadius: '40px',
    color: '#002BE7',
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
